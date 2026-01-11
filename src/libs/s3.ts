/**
 * S3 관련 유틸리티 함수
 */

import Config from 'react-native-config';

/**
 * 환경 변수에서 S3 설정 가져오기
 */
let S3_BUCKET_NAME: string;
let S3_REGION: string;
let S3_BASE_URL: string;

try {
  if (Config && Config.S3_BUCKET_NAME && Config.S3_REGION) {
    S3_BUCKET_NAME = Config.S3_BUCKET_NAME;
    S3_REGION = Config.S3_REGION;
    S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;
  } else {
    throw new Error('S3_BUCKET_NAME 또는 S3_REGION 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
} catch (error) {
  if (error instanceof Error && error.message.includes('S3_')) {
    throw error;
  }
  throw new Error('환경 변수를 불러올 수 없습니다. react-native-config 설정을 확인해주세요.');
}

/**
 * S3 이미지 키를 URL로 변환
 * @param imageKey S3 이미지 키 (예: "uploads/file.jpg")
 * @returns S3 이미지 URL
 */
export const getS3ImageUrl = (imageKey: string | null | undefined): string | null => {
  if (!imageKey) return null;

  // 이미 URL인 경우 http를 https로 변환하여 반환
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey.replace('http://', 'https://');
  }

  // S3 키를 URL로 변환
  return `${S3_BASE_URL}/${imageKey}`;
};

/**
 * S3 URL에서 이미지 키 추출
 * @param s3Url S3 이미지 URL (예: https://<bucket>.s3.<region>.amazonaws.com/uploads/file.jpg)
 * @returns S3 이미지 키 (예: uploads/file.jpg) 또는 null
 */
export const extractS3Key = (s3Url: string): string | null => {
  try {
    // URL에서 프로토콜과 도메인 제거하여 경로만 추출
    // https://<bucket>.s3.<region>.amazonaws.com/uploads/file.jpg?query=value -> uploads/file.jpg
    const pathStart = s3Url.indexOf('.com/');
    if (pathStart === -1) {
      throw new Error('유효하지 않은 S3 URL 형식');
    }
    let key = s3Url.substring(pathStart + 5);
    const queryIndex = key.indexOf('?');
    if (queryIndex !== -1) {
      key = key.substring(0, queryIndex);
    }
    return key;
  } catch (error) {
    console.error("Error extracting S3 key:", error); // Add console.error for better debugging
    return null;
  }
};
