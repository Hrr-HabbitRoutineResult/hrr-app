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
  verified?: boolean;
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
 * 챌린지 클릭 처리 (인기 챌린지 집계용)
 */
export const trackChallengeClick = async (challengeId: number): Promise<void> => {
  try {
    await apiClient.post(`/api/v1/challenges/${challengeId}/click`);
  } catch (error: any) {
    // 클릭 트래킹 실패는 조용히 무시 (사용자 경험에 영향 없음)
    console.warn('챌린지 클릭 트래킹 실패:', error);
  }
};

/**
 * 챌린지 목록 조회 파라미터
 */
export interface GetChallengesParams {
  category?: 'ALL' | 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT';
  isUpcoming?: boolean;
  sortType?: 'LATEST' | 'OLDEST' | 'POPULAR';
  day?: string[];
  title?: string;
  page?: number;
  size?: number;
}

/**
 * 챌린지 목록 조회 응답
 */
export interface GetChallengesResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: ChallengeInfo[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 챌린지 목록 조회
 */
export const getChallenges = async (params?: GetChallengesParams): Promise<GetChallengesResponse['result']> => {
  try {
    const response = await apiClient.get<GetChallengesResponse>(
      '/api/v1/challenges',
      {
        params: params || {},
      }
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '챌린지 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * S3 Presigned URL 요청 응답
 */
export interface PresignedUrlResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    presignedUrl: string;
    s3Key: string;
  };
}

/**
 * S3 Presigned URL 요청
 */
export const getPresignedUrl = async (fileName: string): Promise<PresignedUrlResponse['result']> => {
  try {
    const response = await apiClient.post<PresignedUrlResponse>(
      '/api/s3/presigned-url',
      { fileName }
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || 'Presigned URL을 받는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 챌린지 생성 요청
 */
export interface CreateChallengeRequest {
  title: string;
  description: string;
  isPublic: boolean;
  password?: string;
  category: 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT';
  verificationType: 'PHOTO' | 'TEXT';
  startDate: string;
  maxParticipants: number;
  isViewerMode: boolean;
  rule: string;
  verifyStartTime: string;
  verifyEndTime: string;
  daysOfWeek: string[];
  imageKey: string;
}

/**
 * 챌린지 생성 응답
 */
export interface CreateChallengeResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    id: number;
  };
}

/**
 * 챌린지 생성 에러 응답
 */
export interface CreateChallengeErrorResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
}

/**
 * 챌린지 생성
 */
export const createChallenge = async (data: CreateChallengeRequest): Promise<CreateChallengeResponse['result']> => {
  try {
    const response = await apiClient.post<CreateChallengeResponse>(
      '/api/v1/challenges',
      data
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    // 에러 응답 생성
    const error: any = new Error(response.data.message || '챌린지 생성에 실패했습니다.');
    error.response = {
      data: {
        isSuccess: response.data.isSuccess,
        status: response.data.status,
        code: response.data.code,
        message: response.data.message,
      } as CreateChallengeErrorResponse,
    };
    throw error;
  } catch (error: any) {
    // axios 에러인 경우 그대로 throw
    throw error;
  }
};

/**
 * ============================================
 * 랜덤 미션 관련
 * ============================================
 */

/**
 * 오늘의 랜덤 미션 완료 여부 응답
 */
export interface DailyMissionCompletedResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: boolean;
}

/**
 * 오늘의 랜덤 미션 완료 여부 조회
 */
export const getDailyMissionCompleted = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<DailyMissionCompletedResponse>(
      '/api/v1/users/mission/daily/completed'
    );

    if (response.data.isSuccess) {
      return response.data.result;
    }

    throw new Error(response.data.message || '랜덤 미션 완료 여부를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 오늘의 랜덤 미션 정보
 */
export interface DailyMissionInfo {
  missionId: number;
  title: string;
  content: string;
  isCompleted: boolean;
  imageUrl: string;
}

/**
 * 오늘의 랜덤 미션 조회 응답
 */
export interface DailyMissionResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: DailyMissionInfo;
}

/**
 * 오늘의 랜덤 미션 조회
 */
export const getDailyMission = async (): Promise<DailyMissionInfo> => {
  try {
    const response = await apiClient.get<DailyMissionResponse>(
      '/api/v1/users/mission/daily'
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '랜덤 미션을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 오늘의 랜덤 미션 인증 요청
 */
export interface VerifyDailyMissionRequest {
  missionId: number;
  imageKey: string;
}

/**
 * 오늘의 랜덤 미션 인증 응답
 */
export interface VerifyDailyMissionResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: string;
}

/**
 * 오늘의 랜덤 미션 인증
 */
export const verifyDailyMission = async (
  data: VerifyDailyMissionRequest
): Promise<string> => {
  try {
    const response = await apiClient.post<VerifyDailyMissionResponse>(
      '/api/v1/users/mission/daily/verify',
      data
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '랜덤 미션 인증에 실패했습니다.');
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
  image_key: string;
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

/**
 * ============================================
 * 챌린지 인증 관련
 * ============================================
 */

/**
 * 사진 인증 게시글 작성 요청
 */
export interface CreatePhotoVerificationRequest {
  title: string;
  content: string;
  s3Key: string;
  isQuestion: boolean;
}

/**
 * 사진 인증 게시글 작성 응답
 */
export interface VerificationDetail {
  verificationId: number;
  roundId: number;
  challengeId: number;
  userChallengeId: number;
  type: string;
  title: string;
  content: string;
  photoUrl: string;
  textUrl: string;
  isQuestion: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userNickname: string;
  isAdopted: boolean;
  verificationCount: number;
}

export interface CreatePhotoVerificationResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: VerificationDetail;
}

/**
 * 사진 인증 게시글 작성
 */
export const createPhotoVerification = async (
  challengeId: number,
  data: CreatePhotoVerificationRequest
): Promise<VerificationDetail> => {
  try {
    const response = await apiClient.post<CreatePhotoVerificationResponse>(
      `/api/v1/verifications/${challengeId}/photo`,
      data
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '게시글 작성에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 게시글 상세 조회 요청 파라미터
 */
export interface GetVerificationDetailParams {
  page?: number;
  size?: number;
}

/**
 * 게시글 상세 조회 응답 - 댓글
 */
export interface Comment {
  commentId: number;
  parentId: number;
  verificationId: number;
  userId: number;
  userName: string;
  userProfileUrl: string;
  depth: number;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  anonymous: boolean;
}

/**
 * 게시글 상세 조회 응답 - 댓글 목록
 */
export interface CommentsData {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  totalParentElements: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * 게시글 상세 조회 응답 - 사용자 정보
 */
export interface VerificationUser {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  role: string;
}

/**
 * 게시글 상세 조회 응답 - 라운드 정보
 */
export interface RoundInfo {
  startDate: string;
  endDate: string;
  verificationCount: number;
  warnCount: number;
}

/**
 * 게시글 상세 조회 응답
 */
export interface VerificationDetailResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    verificationId: number;
    roundId: number;
    roundNumber: number;
    challengeId: number;
    challengeName: string;
    type: string;
    title: string;
    content: string;
    textUrl: string;
    photoUrl: string;
    isQuestion: boolean;
    isResolved: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    isMine: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSelectComment: boolean;
    user: VerificationUser;
    roundInfo: RoundInfo;
    comments: CommentsData;
  };
}

/**
 * 게시글 상세 조회
 */
export const getVerificationDetail = async (
  verificationId: number,
  params?: GetVerificationDetailParams
): Promise<VerificationDetailResponse['result']> => {
  try {
    const response = await apiClient.get<VerificationDetailResponse>(
      `/api/v1/verifications/${verificationId}`,
      {
        params: {
          page: params?.page || 1,
          size: params?.size || 10,
        },
      }
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '게시글을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};
