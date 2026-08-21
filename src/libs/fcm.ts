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
    try {
      const authStatus = await messaging().requestPermission();
      console.log('[FCM] iOS 권한 요청 결과:', authStatus);

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('[FCM] ❌ 권한 거부됨. 상태:', authStatus);
        return null;
      }

      console.log(
        '[FCM] ✅ 권한 승인. registerDeviceForRemoteMessages() 호출...',
      );
      await messaging().registerDeviceForRemoteMessages();
      console.log('[FCM] ✅ registerDeviceForRemoteMessages() 완료');
    } catch (error) {
      console.error('[FCM] ❌ iOS 권한 요청 실패:', error);
      return null;
    }
  }

  if (Platform.OS === 'android') {
    const granted = await requestAndroidNotificationPermission();
    if (!granted) {
      console.warn('[FCM] ❌ Android 권한 거부됨');
      return null;
    }
    console.log('[FCM] ✅ Android 권한 승인');
  }

  try {
    const token = await messaging().getToken();
    console.log('[FCM] ✅ FCM 토큰 획득:', token?.substring(0, 20) + '...');

    // iOS: APNs 토큰 확인
    if (Platform.OS === 'ios') {
      const apnsToken = await messaging().getAPNSToken();
      console.log('[FCM] iOS APNs 토큰:', apnsToken ? '✅ 등록됨' : '❌ 없음');
    }

    return token || null;
  } catch (error) {
    console.error('[FCM] ❌ getToken() 실패:', error);
    return null;
  }
};

/**
 * FCM 토큰을 취득해 서버에 등록함
 */
export const registerFcmTokenSilently = async (): Promise<void> => {
  try {
    console.log('[FCM] FCM 토큰 등록 시작...');
    const [token, storedUserId] = await Promise.all([
      getFcmToken(),
      AsyncStorage.getItem('userId'),
    ]);

    console.log('[FCM] 토큰:', token ? '✅ 있음' : '❌ 없음');
    console.log('[FCM] userId:', storedUserId ? '✅ 있음' : '❌ 없음');

    if (!token || !storedUserId) {
      console.warn('[FCM] ⚠️ 토큰 또는 userId 없음, 등록 스킵');
      return;
    }

    console.log('[FCM] 서버에 토큰 등록 중... (userId:', storedUserId, ')');
    await registerFcmToken(Number(storedUserId), token);
    console.log('[FCM] ✅ 서버 등록 성공');
  } catch (error) {
    console.error('[FCM] ❌ 토큰 등록 실패:', error);
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
