import { login, logout, getProfile, KakaoOAuthToken } from '@react-native-seoul/kakao-login';
import { kakaoLoginByToken, SocialLoginResponse } from '../api/auth';

/**
 * 카카오 SDK 로그인
 * - 성공 시 카카오 액세스 토큰 반환
 * - 사용자 취소 시 null 반환 (에러 처리 X)
 */
export const loginWithKakao = async (): Promise<string | null> => {
  try {
    const token: KakaoOAuthToken = await login();
    
    if (token.accessToken) {
      return token.accessToken;
    }
    
    return null;
  } catch (error) {
    // 사용자 취소는 에러로 처리되지 않도록 null 반환
    if (error instanceof Error) {
      if (error.message.includes('cancel') || error.message.includes('취소') || error.message.includes('Cancel')) {
        return null;
      }
    } else {
      const errorString = String(error);
      if (errorString.includes('cancel') || errorString.includes('취소') || errorString.includes('Cancel')) {
        return null;
      }
    }
    
    // 실제 에러인 경우 throw
    throw error;
  }
};

/**
 * 카카오 계정 로그아웃 (SDK)
 */
export const logoutWithKakao = async (): Promise<void> => {
  try {
    await logout();
  } catch (error) {
    throw error;
  }
};

/**
 * 카카오 프로필 조회 (SDK)
 */
export const getKakaoProfile = async () => {
  try {
    const profile = await getProfile();
    return profile;
  } catch (error) {
    throw error;
  }
};

/**
 * 카카오 액세스 토큰을 서버에 전달해 서비스 내부 로그인 처리
 */
export const handleKakaoLogin = async (
  kakaoAccessToken: string
): Promise<SocialLoginResponse> => {
  try {
    const response = await kakaoLoginByToken(kakaoAccessToken);
    return response;
  } catch (error) {
    throw error;
  }
};
