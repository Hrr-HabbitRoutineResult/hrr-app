import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { logout as logoutAPI } from '../api/auth';

/**
 * 로그아웃 이벤트 이름
 */
export const LOGOUT_EVENT = 'user_logout';

/**
 * 로그아웃 처리
 */
export const handleLogout = async (): Promise<void> => {
  try {
    // 서버 로그아웃 API 호출
    await logoutAPI();
  } catch {
    // 서버 로그아웃 실패는 무시 (네트워크 오류 등으로 실패해도 로컬 정리는 필요)
  }

  // 로컬 저장소의 모든 인증 정보 삭제
  try {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userId',
      'nickname',
      'termsAgreed',
    ]);
  } catch (error) {
    // AsyncStorage 삭제 실패는 무시 (이미 로그아웃 상태로 간주)
  }

  // 로그아웃 이벤트 발생 (App.tsx에서 상태 업데이트)
  DeviceEventEmitter.emit(LOGOUT_EVENT);
};

