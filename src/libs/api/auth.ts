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
    name: string;
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
 * 네이버 액세스 토큰 및 리프레시 토큰을 서버에 전달해 로그인 처리
 */
export const naverLoginByToken = async (
  naverAccessToken: string,
  naverRefreshToken: string
): Promise<SocialLoginResponse> => {
  try {
    const response = await apiClient.post<SocialLoginResponse>(
      `/api/v1/auth/login/naver`,
      {
        accessToken: naverAccessToken,
        refreshToken: naverRefreshToken,
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * 애플 로그인 요청 바디
 */
export interface AppleLoginRequest {
  authorizationCode: string;
  firstName: string;
  lastName: string;
}

/**
 * 애플 로그인 정보를 서버에 전달해 로그인 처리
 */
export const appleLogin = async (
  appleLoginData: AppleLoginRequest
): Promise<SocialLoginResponse> => {
  try {
    const response = await apiClient.post<SocialLoginResponse>(
      `/api/v1/auth/login/apple`,
      appleLoginData
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 약관 관련
 * ============================================
 */

/**
 * 개별 약관 데이터
 */
export interface Term {
  id: number;
  title: string;
  isRequired: boolean;
}

/**
 * 약관 목록 조회 응답
 */
export interface TermsListResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: Term[];
}

/**
 * 약관 동의 요청 바디
 */
export interface TermsAgreeRequest {
  agreedTermIds: number[];
}

/**
 * 약관 동의 응답
 */
export interface TermsAgreeResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result?: any;
}

/**
 * 약관 목록 조회
 */
export const getTermsList = async (
  accessToken: string
): Promise<TermsListResponse> => {
  try {
    const response = await apiClient.get<TermsListResponse>(
      `/api/v1/terms`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 약관 동의 요청
 * - 사용자가 선택한 약관 ID 배열을 서버에 전달
 */
export const agreeTerms = async (
  accessToken: string,
  agreedTermIds: number[]
): Promise<TermsAgreeResponse> => {
  try {
    const response = await apiClient.post<TermsAgreeResponse>(
      `/api/v1/users/terms/agree`,
      { agreedTermIds },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 닉네임 관련
 * ============================================
 */

/**
 * 닉네임 중복 확인 응답
 * - result: true: 사용 가능, false: 사용 불가
 */
export interface NicknameCheckResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: boolean;
}

/**
 * 닉네임 설정 요청 바디
 */
export interface NicknameSetRequest {
  nickname: string;
}

/**
 * 닉네임 설정 응답
 */
export interface NicknameSetResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    nickname: string;
    message: string;
    nextStep: string;
  };
}

/**
 * 닉네임 중복 여부 조회
 */
export const checkNickname = async (
  accessToken: string,
  nickname: string
): Promise<NicknameCheckResponse> => {
  try {
    const response = await apiClient.get<NicknameCheckResponse>(
      `/api/v1/user/nickname/check`,
      {
        params: {
          nickname,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * 닉네임 설정
 */
export const setNickname = async (
  accessToken: string,
  nickname: string
): Promise<NicknameSetResponse> => {
  try {
    const response = await apiClient.post<NicknameSetResponse>(
      `/api/v1/user/nickname`,
      { nickname },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
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

/**
 * ============================================
 * 로그아웃
 * ============================================
 */

/**
 * 로그아웃 응답
 */
export interface LogoutResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result?: any;
}

/**
 * 로그아웃 API 호출
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>('/api/v1/auth/logout', {});
  return response.data;
};

/**
 * ============================================
 * 회원탈퇴
 * ============================================
 */

/**
 * 회원탈퇴 응답
 */
export interface WithdrawResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: string; // As per user's provided response format
}

/**
 * 회원탈퇴 API 호출
 */
export const withdraw = async (): Promise<WithdrawResponse> => {
  try {
    const response = await apiClient.post<WithdrawResponse>(`/api/v1/auth/withdraw`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
