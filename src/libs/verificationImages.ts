import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { getPresignedUrl } from './api/challenge';

interface UploadedImage {
  s3Key: string;
  imageUrl: string;
}

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

// 기존 presigned PUT API와 플랫폼별 업로드 방식을 원본/합성본에 함께 사용합니다.
async function uploadImage(
  imageUri: string,
  kind: 'original' | 'stamped',
  mimeType: string,
): Promise<UploadedImage> {
  const extension = extensions[mimeType] || 'jpg';
  const { presignedUrl, s3Key } = await getPresignedUrl(
    `challenge-cert-${kind}-${Date.now()}.${extension}`,
  );
  const headers: Record<string, string> = { 'Content-Type': mimeType };
  const query = presignedUrl.split('?')[1] || '';
  if (query.includes('X-Amz-SignedHeaders') && query.includes('x-amz-acl')) {
    headers['x-amz-acl'] = 'public-read';
  }

  if (Platform.OS === 'android') {
    const localPath = imageUri.replace(/^file:\/\//, '');
    const response = await RNBlobUtil.fetch(
      'PUT', presignedUrl, headers, RNBlobUtil.wrap(localPath),
    );
    const status = response.info().status;
    if (status !== 200 && status !== 204) throw new Error(`업로드 실패 (${status})`);
  } else {
    const localUri = imageUri.startsWith('/') ? `file://${imageUri}` : imageUri;
    const response = await fetch(localUri);
    if (!response.ok) throw new Error('이미지 로드 실패');
    const blob = await response.blob();
    if (blob.size === 0) throw new Error('이미지가 비어있습니다.');
    const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: blob, headers });
    if (!uploadResponse.ok) throw new Error(`업로드 실패 (${uploadResponse.status})`);
  }

  return { s3Key, imageUrl: presignedUrl.split('?')[0] };
}

export async function uploadVerificationImages(
  originalUri: string,
  stampedUri: string,
  originalMimeType = 'image/jpeg',
): Promise<{ s3Key: string; originalS3Key: string; imageUri: string }> {
  const original = await uploadImage(originalUri, 'original', originalMimeType);
  const stamped = await uploadImage(stampedUri, 'stamped', 'image/jpeg');
  return {
    s3Key: stamped.s3Key,
    originalS3Key: original.s3Key,
    imageUri: stamped.imageUrl,
  };
}
