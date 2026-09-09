import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { createPhotoVerification } from '../src/libs/api/challenge';
import { apiClient } from '../src/libs/api/client';
import { uploadVerificationImages } from '../src/libs/verificationImages';

jest.mock('react-native-blob-util', () => ({
  fetch: jest.fn(), wrap: (path: string) => `wrapped:${path}`,
}));
jest.mock('../src/libs/api/client', () => ({ apiClient: { post: jest.fn() } }));

const post = jest.mocked(apiClient.post);
const nativeUpload = jest.mocked(RNBlobUtil.fetch);
const originalFetch = globalThis.fetch;
const originalOS = Platform.OS;
const mockFetch = jest.fn();
const originalBytes = { size: 10, testContents: 'original without timestamp' };
const stampedBytes = { size: 20, testContents: 'composited with timestamp' };
const originalUrl = 'https://s3.example/original.jpg?X-Amz-Signature=original';
const stampedUrl = 'https://s3.example/stamped.jpg?X-Amz-Signature=stamped';

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = mockFetch;
  post.mockResolvedValueOnce({ data: { isSuccess: true, result: {
    presignedUrl: originalUrl, s3Key: 'photos/raw-key.jpg',
  } } }).mockResolvedValueOnce({ data: { isSuccess: true, result: {
    presignedUrl: stampedUrl, s3Key: 'photos/stamped-key.jpg',
  } } });
  nativeUpload.mockResolvedValue({ info: () => ({ status: 200 }) } as any);
  mockFetch.mockImplementation(async (url: string) => ({
    ok: true, status: 200, blob: async () => url.includes('raw') ? originalBytes : stampedBytes,
  }));
});
afterEach(() => { globalThis.fetch = originalFetch; Platform.OS = originalOS; });

it.each(['ios', 'android'] as const)('uploads distinct files and submits exact returned keys on %s', async os => {
  Platform.OS = os;
  const images = await uploadVerificationImages('file:///camera/raw.jpg', 'file:///capture/stamped.jpg');
  expect(images).toEqual({ s3Key: 'photos/stamped-key.jpg', originalS3Key: 'photos/raw-key.jpg',
    imageUri: 'https://s3.example/stamped.jpg' });
  expect(post.mock.calls.slice(0, 2)).toEqual([
    ['/api/s3/presigned-url', { fileName: expect.stringMatching(/^challenge-cert-original-\d+\.jpg$/) }],
    ['/api/s3/presigned-url', { fileName: expect.stringMatching(/^challenge-cert-stamped-\d+\.jpg$/) }],
  ]);
  if (os === 'ios') {
    expect(nativeUpload).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(originalUrl, expect.objectContaining({ method: 'PUT', body: originalBytes }));
    expect(mockFetch).toHaveBeenCalledWith(stampedUrl, expect.objectContaining({ method: 'PUT', body: stampedBytes }));
  } else {
    expect(mockFetch).not.toHaveBeenCalled();
    expect(nativeUpload).toHaveBeenNthCalledWith(1, 'PUT', originalUrl,
      { 'Content-Type': 'image/jpeg' }, 'wrapped:/camera/raw.jpg');
    expect(nativeUpload).toHaveBeenNthCalledWith(2, 'PUT', stampedUrl,
      { 'Content-Type': 'image/jpeg' }, 'wrapped:/capture/stamped.jpg');
  }
  post.mockResolvedValueOnce({ data: { isSuccess: true, result: { verificationId: 42 } } });
  await createPhotoVerification(9, { title: 'Photo', content: 'Content',
    s3Key: images.s3Key, originalS3Key: images.originalS3Key, isQuestion: false });
  expect(post).toHaveBeenLastCalledWith('/api/v1/verifications/9/photo', {
    title: 'Photo', content: 'Content', s3Key: 'photos/stamped-key.jpg',
    originalS3Key: 'photos/raw-key.jpg', isQuestion: false,
  });
});

it('preserves Android content URIs and the camera asset MIME type', async () => {
  Platform.OS = 'android';
  await uploadVerificationImages('content://camera/123', '/capture/stamped.jpg', 'image/png');
  expect(nativeUpload).toHaveBeenNthCalledWith(1, 'PUT', originalUrl,
    { 'Content-Type': 'image/png' }, 'wrapped:content://camera/123');
  expect(post.mock.calls[0][1]).toEqual({ fileName: expect.stringMatching(/\.png$/) });
});

it.each(['ios', 'android'] as const)('rejects a failed second upload on %s before returning a publishable pair', async os => {
  Platform.OS = os;
  if (os === 'android') {
    nativeUpload.mockResolvedValueOnce({ info: () => ({ status: 200 }) } as any)
      .mockResolvedValueOnce({ info: () => ({ status: 403 }) } as any);
  } else {
    mockFetch.mockImplementation(async (url: string) => ({ ok: url !== stampedUrl, status: 403,
      blob: async () => originalBytes }));
  }
  await expect(uploadVerificationImages('file:///raw.jpg', 'file:///stamped.jpg')).rejects.toThrow('403');
  expect(post).toHaveBeenCalledTimes(2); // presign only; no verification creation
});

it('stops if the original file is empty on iOS', async () => {
  Platform.OS = 'ios';
  mockFetch.mockResolvedValue({ ok: true, blob: async () => ({ size: 0 }) });
  await expect(uploadVerificationImages('file:///raw.jpg', 'file:///stamped.jpg')).rejects.toThrow('비어');
  expect(post).toHaveBeenCalledTimes(1);
});
