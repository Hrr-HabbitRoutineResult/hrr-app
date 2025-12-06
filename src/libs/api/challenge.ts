import { apiClient } from './client';

/**
 * ============================================
 * 챌린지 관련
 * ============================================
 */

/**
 * 챌린지 캐러셀용 타입 (공통)
 */
export interface Challenge {
  id: number;
  thumbnail: string;
  title: string;
  todayEligible?: boolean;
}

/**
 * 챌린지 정보 (목록용)
 */
export interface ChallengeInfo {
  challengeId: number;
  title: string;
  description: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  isUpcoming: boolean;
  daysOfWeek: string | string[];
  thumbnailUrl: string;
  ddayUntilStart: number;
}

/**
 * 오늘의 인기 챌린지 아이템
 */
export interface DailyTopChallengeItem {
  ranking: number;
  clickCount: number;
  info: ChallengeInfo;
}

/**
 * 오늘의 인기 챌린지 목록 응답
 */
export interface DailyTopChallengesResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: DailyTopChallengeItem[];
}

/**
 * 챌린지 상세 정보 (단건 조회용)
 */
export interface ChallengeDetail {
  challengeId: number;
  title: string;
  description: string;
  imageUrl: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  startDate: string;
  endDate: string;
  remainDays: number;
  isPublic: boolean;
  isObserverMode: boolean;
  isParticipant: boolean;
  isLiked: boolean;
  actionButtonStatus: 'DISABLED' | 'CERTIFIED' | 'CERTIFY_AVAILABLE' | 'WAITLIST' | 'JOIN';
  owner: {
    id: number;
    nickname: string;
    profileImageUrl: string;
  };
}

/**
 * 챌린지 상세 정보 응답
 */
export interface ChallengeDetailResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: ChallengeDetail;
}

/**
 * 챌린지 프로필 정보 (프로필 탭용)
 */
export interface ChallengeProfile {
  challengeId: number;
  isParticipating: boolean;
  rule: string;
  targetDays: string[];
  verifyStartTime: string;
  verifyEndTime: string;
  verifiedDaysThisWeek: string[];
}

/**
 * 챌린지 프로필 응답
 */
export interface ChallengeProfileResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: ChallengeProfile;
}

/**
 * 오늘의 인기 챌린지 목록 조회
 */
export const getDailyTopChallenges = async (number: number = 3): Promise<DailyTopChallengeItem[]> => {
  try {
    const response = await apiClient.get<DailyTopChallengesResponse>(
      '/api/v1/challenges/daily-top',
      {
        params: { number },
      }
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '오늘의 인기 챌린지를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 상세 정보 조회
 */
export const getChallengeDetail = async (challengeId: number): Promise<ChallengeDetail> => {
  try {
    const response = await apiClient.get<ChallengeDetailResponse>(
      `/api/v1/challenges/${challengeId}/info`
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '챌린지 정보를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 찜하기/취소 응답
 */
export interface ChallengeLikeResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    challengeId: number;
    isLiked: boolean;
    likeCount: number;
  };
}

/**
 * 챌린지 프로필 정보 조회 (규칙, 요일, 인증 시간 등)
 */
export const getChallengeProfile = async (challengeId: number): Promise<ChallengeProfile> => {
  try {
    const response = await apiClient.get<ChallengeProfileResponse>(
      `/api/v1/challenges/${challengeId}/profile`
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '챌린지 프로필 정보를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 찜하기
 */
export const likeChallenge = async (challengeId: number): Promise<ChallengeLikeResponse['result']> => {
  try {
    const response = await apiClient.post<ChallengeLikeResponse>(
      `/api/v1/challenges/${challengeId}/likes`
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '찜하기 처리에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 찜하기 취소
 */
export const unlikeChallenge = async (challengeId: number): Promise<ChallengeLikeResponse['result']> => {
  try {
    const response = await apiClient.delete<ChallengeLikeResponse>(
      `/api/v1/challenges/${challengeId}/likes`
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    
    throw new Error(response.data.message || '찜하기 취소에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 참가하기 응답
 */
export interface ChallengeJoinResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    password?: string;
  };
}

/**
 * 챌린지 참가하기
 */
export const joinChallenge = async (challengeId: number, password?: string): Promise<void> => {
  try {
    const response = await apiClient.post<ChallengeJoinResponse>(
      `/api/v1/challenges/${challengeId}/join`,
      { password: password || null }
    );
    
    if (response.data.isSuccess) {
      return;
    }
    
    throw new Error(response.data.message || '챌린지 참가에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 챌린지 추천 관련
 * ============================================
 */

/**
 * 챌린지 추천 요청
 */
export interface ChallengeRecommendationRequest {
  userId: number;
  gender: 'MALE' | 'FEMALE';
  ageGroup: 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES_PLUS';
  job: 'STUDENT_MIDDLE_HIGH' | 'STUDENT_UNIVERSITY' | 'JOB_SEEKER' | 'EMPLOYEE' | 'HOMEMAKER' | 'ETC';
  // TODO: 시간대 다중 선택 지원 필요
  availableTime: 'EARLY_MORNING' | 'MORNING' | 'LUNCH' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'LATE_NIGHT';
  category: string[];
  goal: 'BUILD_EXERCISE_HABIT' | 'HEALTHY_DAY' | 'EXAM_CAREER_PREP' | 'FIND_NEW_HOBBY' | 'ENJOY_HOBBY_TOGETHER' | 'FOCUS_ON_MYSELF' | 'KEEP_GOING';
}

/**
 * 추천 챌린지 아이템
 */
export interface RecommendedChallenge {
  challengeId: number;
  title: string;
  description: string;
  category: string;
  verifyStartTime: string;
  verifyEndTime: string;
  cert_time_slots: string;
  goal_text: string;
}

/**
 * 챌린지 추천 응답
 */
export interface ChallengeRecommendationResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    userId: number;
    modelVersion: string;
    latencyMs: number;
    recommendations: RecommendedChallenge[];
  };
}

/**
 * 챌린지 추천 받기
 */
export const getChallengeRecommendations = async (
  request: ChallengeRecommendationRequest
): Promise<RecommendedChallenge[]> => {
  try {
    const response = await apiClient.post<ChallengeRecommendationResponse>(
      '/api/v1/challenges/recommendations',
      request
    );
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.recommendations;
    }
    
    throw new Error(response.data.message || '챌린지 추천을 받는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};
