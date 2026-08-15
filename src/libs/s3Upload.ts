import { Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { getPresignedUrl } from './api/challenge';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

export interface UploadedImage {
  /** 서버에 전달하는 S3 오브젝트 키 */
  s3Key: string;
  /** 쿼리스트링을 제거한 공개 URL */
  imageUrl: string;
}

const getMimeType = (extension: string): string =>
  MIME_TYPES[extension.toLowerCase()] || MIME_TYPES.jpg;

/** Android는 file:// prefix가 빠진 경로가 올 수 있어 보정한다. */
const normalizeUri = (imageUri: string): string => {
  if (
    Platform.OS === 'android' &&
    !imageUri.startsWith('file://') &&
    !imageUri.startsWith('content://')
  ) {
    return `file://${imageUri}`;
  }
  return imageUri;
};

/** presigned URL 서명에 x-amz-acl이 포함된 경우에만 헤더를 추가한다. */
const buildUploadHeaders = (
  presignedUrl: string,
  mimeType: string,
): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': mimeType };
  const query = presignedUrl.split('?')[1];
  if (
    query &&
    query.includes('X-Amz-SignedHeaders') &&
    query.includes('x-amz-acl')
  ) {
    headers['x-amz-acl'] = 'public-read';
  }
  return headers;
};

/**
 * S3 presigned PUT 업로드.
 * - Android: `fetch(file://...)`가 실패하므로 react-native-blob-util 사용
 * - iOS: fetch + blob 방식
 *
 * 실패 시 예외를 던지므로 호출부에서 사용자 메시지를 처리한다.
 */
export const uploadImageToS3 = async (
  imageUri: string,
  fileNamePrefix: string = 'image',
): Promise<UploadedImage> => {
  const normalizedUri = normalizeUri(imageUri);
  const fileExtension = normalizedUri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${fileNamePrefix}-${Date.now()}.${fileExtension}`;
  const mimeType = getMimeType(fileExtension);

  const { presignedUrl, s3Key } = await getPresignedUrl(fileName);
  const uploadHeaders = buildUploadHeaders(presignedUrl, mimeType);

  if (Platform.OS === 'android') {
    const localPath = normalizedUri.replace(/^file:\/\//, '');
    const response = await RNBlobUtil.fetch(
      'PUT',
      presignedUrl,
      uploadHeaders,
      RNBlobUtil.wrap(localPath),
    );
    const status = response.info().status;
    if (status !== 200 && status !== 204) {
      throw new Error(`업로드 실패 (${status})`);
    }
  } else {
    const fileResponse = await fetch(normalizedUri);
    if (!fileResponse.ok) {
      throw new Error('이미지 로드 실패');
    }
    const blob = await fileResponse.blob();
    if (blob.size === 0) {
      throw new Error('이미지가 비어있습니다.');
    }
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: uploadHeaders,
    });
    if (!uploadResponse.ok) {
      throw new Error(`업로드 실패 (${uploadResponse.status})`);
    }
  }

  return { s3Key, imageUrl: presignedUrl.split('?')[0] };
};
