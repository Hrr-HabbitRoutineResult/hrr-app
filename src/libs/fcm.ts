import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { registerFcmToken, deactivateFcmToken } from './api/notification';

/**
 * iOS: 푸시 알림 권한을 요청하고 현재 기기의 FCM 토큰을 반환
 * Android: 권한 요청 없이 바로 토큰을 가져옴
 *
 * @returns FCM 토큰 문자열, 또는 권한 거부/오류 시 null
 */
export const getFcmToken = async (): Promise<string | null> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      return null;
    }
  }

  const token = await messaging().getToken();
  return token || null;
};

/**
 * FCM 토큰을 취득해 서버에 등록함
 */
export const registerFcmTokenSilently = async (): Promise<void> => {
  try {
    const token = await getFcmToken();
    if (!token) return;
    await registerFcmToken(token);
  } catch {
    // 토큰 등록 실패는 무시
  }
};

/**
 * FCM 토큰을 서버에서 비활성화
 */
export const deactivateFcmTokenSilently = async (): Promise<void> => {
  try {
    const token = await messaging().getToken();
    if (!token) return;
    await deactivateFcmToken(token);
  } catch {
    // 토큰 비활성화 실패는 무시
  }
};
