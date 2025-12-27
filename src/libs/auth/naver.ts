import NaverLogin from '@react-native-seoul/naver-login';
import Config from 'react-native-config';
import { naverLoginByToken, SocialLoginResponse } from '../api/auth';

/**
 * 네이버 로그인 설정 정보
 */
const consumerKey = Config.NAVER_CONSUMER_KEY || '';
const consumerSecret = Config.NAVER_CONSUMER_SECRET || '';
const appName = Config.NAVER_APP_NAME || 'Hrr';
const serviceUrlSchemeIOS = Config.NAVER_SERVICE_URL_SCHEME || '';

/**
 * 네이버 SDK 초기화
 */
export const initNaverLogin = () => {
  NaverLogin.initialize({
    appName,
    consumerKey,
    consumerSecret,
    serviceUrlSchemeIOS,
  });
};

/**
 * 네이버 SDK 로그인
 * - 성공 시 네이버 액세스 토큰과 리프레시 토큰 반환
 * - 실패 또는 취소 시 null 반환
 */
export const loginWithNaver = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    // initialize 먼저 호출
    initNaverLogin();

    const { failureResponse, successResponse } = await NaverLogin.login();

    if (successResponse) {
      return {
        accessToken: successResponse.accessToken,
        refreshToken: successResponse.refreshToken,
      };
    }

    return null;
  } catch (error) {
    // 사용자 취소 처리
    const errorString = String(error);
    if (errorString.includes('cancel') || errorString.includes('취소') || errorString.includes('Cancel')) {
      return null;
    }

    throw error;
  }
};

/**
 * 네이버 로그아웃
 */
export const logoutWithNaver = async (): Promise<void> => {
  try {
    await NaverLogin.logout();
  } catch (error) {
    throw error;
  }
};

/**
 * 네이버 토큰을 서버에 전달해 서비스 내부 로그인 처리
 */
export const handleNaverLogin = async (
  naverAccessToken: string,
  naverRefreshToken: string
): Promise<SocialLoginResponse> => {
  try {
    const response = await naverLoginByToken(naverAccessToken, naverRefreshToken);
    return response;
  } catch (error) {
    throw error;
  }
};
