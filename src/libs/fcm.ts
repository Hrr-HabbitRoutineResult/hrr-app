import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { registerFcmToken, deactivateFcmToken } from './api/notification';

const requestAndroidNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  // Android 12 이하는 별도 권한 요청 불필요
  if ((Platform.Version as number) < 33) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * iOS: 푸시 알림 권한을 요청하고 현재 기기의 FCM 토큰을 반환
 * Android: POST_NOTIFICATIONS 런타임 권한 요청 후 FCM 토큰 반환
 *
 * @returns FCM 토큰 문자열, 또는 권한 거부/오류 시 null
 */
export const getFcmToken = async (): Promise<string | null> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;
    await messaging().registerDeviceForRemoteMessages();
  }

  if (Platform.OS === 'android') {
    const granted = await requestAndroidNotificationPermission();
    if (!granted) return null;
  }

  const token = await messaging().getToken();
  return token || null;
};

/**
 * FCM 토큰을 취득해 서버에 등록함
 */
export const registerFcmTokenSilently = async (): Promise<void> => {
  try {
    const [token, storedUserId] = await Promise.all([
      getFcmToken(),
      AsyncStorage.getItem('userId'),
    ]);
    if (!token || !storedUserId) return;
    await registerFcmToken(Number(storedUserId), token);
  } catch {
    // 토큰 등록 실패는 무시
  }
};

/**
 * FCM 토큰을 서버에서 비활성화
 */
export const deactivateFcmTokenSilently = async (): Promise<void> => {
  try {
    const [token, storedUserId] = await Promise.all([
      messaging().getToken(),
      AsyncStorage.getItem('userId'),
    ]);
    if (!token || !storedUserId) return;
    await deactivateFcmToken(Number(storedUserId), token);
  } catch {
    // 토큰 비활성화 실패는 무시
  }
};
