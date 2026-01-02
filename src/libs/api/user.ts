import { apiClient } from './client';

/**
 * ============================================
 * 사용자 관련
 * ============================================
 */

/**
 * 사용자 정보
 */
export interface UserMe {
  userId: number;
  nickname: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  level: string;
  followerCount: number;
  followingCount: number;
  points: number;
  isPublic: boolean;
  role: string;
  status: string;
  alarmId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 사용자 정보 조회 응답
 */
export interface UserMeResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: UserMe;
}

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getUserMe = async (): Promise<UserMe> => {
  try {
    const response = await apiClient.get<UserMeResponse>('/api/v1/user/me');
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '사용자 정보를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 참여 중인 챌린지 아이템
 */
export interface OngoingChallengeItem {
  challengeId: number;
  title: string;
  description: string;
  image: string;
  currentRound: number;
}

/**
 * 참여 중인 챌린지 목록 응답
 */
export interface OngoingChallengesResponse {
  resultType: string;
  error: any;
  success: {
    content: OngoingChallengeItem[];
    currentPage: number;
    size: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
  };
}

/**
 * 참여 중인 챌린지 목록 조회
 */
export const getOngoingChallenges = async (page: number = 0, size: number = 10): Promise<OngoingChallengeItem[]> => {
  try {
    const response = await apiClient.get(
      '/api/v1/user/me/challenge/ongoing',
      {
        params: { page, size },
      }
    );
    
    // 먼저 다른 API와 동일한 형식 확인 (isSuccess)
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.content || response.data.result;
    }
    
    // resultType 형식 확인
    if (response.data.resultType === 'SUCCESS' && response.data.success) {
      return response.data.success.content;
    }
    
    throw new Error('참여 중인 챌린지를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 내 챌린지 인증 기록 아이템
 */
export interface VerificationHistoryItem {
  verificationId: number;
  challengeId: number;
  challengeTitle: string;
  type: 'CAMERA' | 'TEXT';
  title: string;
  content: string | null;
  photoUrl: string | null;
  textUrl: string | null;
  verifiedAt: string;
}

/**
 * 내 챌린지 인증 기록 응답
 */
export interface VerificationHistoryResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: VerificationHistoryItem[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 내 챌린지 인증 기록 조회
 */
export const getVerificationHistory = async (page: number = 0, size: number = 20): Promise<VerificationHistoryItem[]> => {
  try {
    const response = await apiClient.get<VerificationHistoryResponse>(
      '/api/v1/user/challenges/history',
      {
        params: { page, size },
      }
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result.content;
    }

    throw new Error(response.data.message || '인증 기록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};
