import type { ImageSourcePropType } from 'react-native';

// 인증 목록에서만 원본을 우선합니다. 기존 기록/글 첨부 이미지는 기존 source를 유지합니다.
export function getCertificationThumbnailSource(
  originalPhotoUrl: string | null | undefined,
  fallback: ImageSourcePropType | null,
): ImageSourcePropType | null {
  return originalPhotoUrl ? { uri: originalPhotoUrl } : fallback;
}
