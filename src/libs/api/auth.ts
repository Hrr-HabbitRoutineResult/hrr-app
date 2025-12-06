import { apiClient } from './client';

/**
 * ============================================
 * 소셜 로그인
 * ============================================
 */

/**
 * 서버에서 반환하는 소셜 로그인 결과 데이터
 */
export interface SocialLoginResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    userId: number;
    accessToken: string;
    refreshToken: string;
    nickname: string;
    loginStatus: 'NEW' | 'EXISTING';
    nextStep: string;
  };
}

/**
 * 카카오 액세스 토큰을 서버에 전달해 로그인 처리
 */
export const kakaoLoginByToken = async (
  kakaoAccessToken: string
): Promise<SocialLoginResponse> => {
  try {
    const response = await apiClient.post<SocialLoginResponse>(
      `/api/v1/auth/login/kakao`,
      { accessToken: kakaoAccessToken }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 토큰 재발급
 * ============================================
 */

/**
 * 토큰 재발급 응답
 * - result.accessToken: 새로운 액세스 토큰
 */
export interface TokenReissueResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    accessToken: string;
  };
}

/**
 * 리프레시 토큰으로 액세스 토큰 재발급
 */
export const reissueAccessToken = async (
  refreshToken: string
): Promise<TokenReissueResponse> => {
  try {
    const response = await apiClient.post<TokenReissueResponse>(
      `/api/v1/auth/reissue`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
