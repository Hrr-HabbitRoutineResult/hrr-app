import appleAuth from '@invertase/react-native-apple-authentication';
import { appleLogin, SocialLoginResponse, AppleLoginRequest } from '../api/auth';

/**
 * 애플 로그인 데이터
 */
export interface AppleAuthResponse {
  authorizationCode: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * 애플 SDK 로그인
 * - 성공 시 애플 인증 데이터 반환
 * - 사용자 취소 시 null 반환 (에러 처리 X)
 */
export const loginWithApple = async (): Promise<AppleAuthResponse | null> => {
  try {
    // 애플 로그인 요청 실행
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // 인증 코드 확인
    if (!appleAuthRequestResponse.authorizationCode) {
      return null;
    }

    // 사용자 정보 추출
    const { authorizationCode, fullName } = appleAuthRequestResponse;
    
    return {
      authorizationCode,
      firstName: fullName?.givenName || '',
      lastName: fullName?.familyName || '',
    };
  } catch (error: any) {
    // 사용자가 취소한 경우 (Error 1001) 조용히 처리
    if (error.code === appleAuth.Error.CANCELED) {
      return null;
    }
    
    // 실제 에러인 경우 throw
    throw error;
  }
};

/**
 * 애플 인증 데이터를 서버에 전달해 서비스 내부 로그인 처리
 */
export const handleAppleLogin = async (
  appleAuthData: AppleAuthResponse
): Promise<SocialLoginResponse> => {
  try {
    const loginData: AppleLoginRequest = {
      authorizationCode: appleAuthData.authorizationCode,
      firstName: appleAuthData.firstName || '',
      lastName: appleAuthData.lastName || '',
    };
    
    const response = await appleLogin(loginData);
    return response;
  } catch (error) {
    throw error;
  }
};
