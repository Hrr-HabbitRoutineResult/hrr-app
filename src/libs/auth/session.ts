import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const LOGOUT_EVENT = 'user_logout';

/**
 * 인증 관련 AsyncStorage 키 목록 (로그아웃/세션 만료 시 삭제 대상)
 */
export const SESSION_KEYS = [
  'accessToken',
  'refreshToken',
  'userId',
  'nickname',
  'termsAgreed',
] as const;

/**
 * 로컬 세션 정리 (AsyncStorage 삭제 후 LOGOUT_EVENT 이벤트 발생)
 *
 * 서버 API 호출 없이 클라이언트 측만 정리할 때 사용
 */
export const clearSessionLocally = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([...SESSION_KEYS]);
  } catch {
    // 삭제 실패 시 무시
  }
  DeviceEventEmitter.emit(LOGOUT_EVENT);
};
