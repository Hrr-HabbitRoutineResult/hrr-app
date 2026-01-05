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
  verified: boolean;
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
export const getOngoingChallenges = async (page: number = 1, size: number = 10): Promise<OngoingChallengeItem[]> => {
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

/**
 * 팔로워/팔로잉 아이템
 */
export interface FollowItem {
  id: number;
  nickname: string;
  level: string;
  profilePhoto: string;
  isFollowing: boolean;
}

/**
 * 팔로워/팔로잉 목록 응답
 */
export interface FollowListResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: FollowItem[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 내 팔로워 목록 조회
 */
export const getFollowers = async (page: number = 0, size: number = 20): Promise<FollowItem[]> => {
  try {
    const response = await apiClient.get<FollowListResponse>('/api/v1/follow/me/followers', { params: { page, size } });
    if (response.data.isSuccess) {
      return response.data.result.content;
    }
    throw new Error(response.data.message || '팔로워 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 내 팔로잉 목록 조회
 */
export const getFollowings = async (page: number = 0, size: number = 20): Promise<FollowItem[]> => {
  try {
    const response = await apiClient.get<FollowListResponse>('/api/v1/follow/me/followings', { params: { page, size } });
    if (response.data.isSuccess) {
      return response.data.result.content;
    }
    throw new Error(response.data.message || '팔로잉 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 사용자 팔로우
 */
export const followUser = async (followedUserId: number): Promise<void> => {
  try {
    await apiClient.post(`/api/v1/follow/${followedUserId}`);
  } catch (error: any) {
    throw error;
  }
};

/**
 * 사용자 언팔로우
 */
export const unfollowUser = async (unfollowedUserId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/follow/${unfollowedUserId}`);
  } catch (error: any) {
    throw error;
  }
};

/**
 * 사용자 프로필 업데이트 요청 타입
 */
export interface UpdateUserProfileRequest {
  nickname?: string;
  profileImageKey?: string; // 백엔드 요구사항에 맞춰 profileImage에서 profileImageKey로 변경됨
  isPublic?: boolean;
}

/**
 * 사용자 프로필 업데이트 응답 타입 (UserMe와 동일)
 */
export interface UpdateUserProfileResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: UserMe; // 업데이트된 UserMe 객체를 반환
}

/**
 * 사용자 프로필 업데이트
 */
export const updateUserProfile = async (data: UpdateUserProfileRequest): Promise<UserMe> => {
  try {
    const response = await apiClient.patch<UpdateUserProfileResponse>('/api/v1/user/me', data);
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '프로필 업데이트에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 타인 사용자 정보 조회 관련
 * ============================================
 */

/**
 * 타인 사용자 정보
 */
export interface OtherUser {
  userId: number;
  nickname: string;
  profileImage: string;
  level: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
}

/**
 * 타인 사용자 정보 조회 응답
 */
export interface OtherUserResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: OtherUser;
}

/**
 * 타인 사용자 인증 기록 응답
 */
export interface OtherUserVerificationHistoryResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    isPublic: boolean;
    nickname: string;
    verifications: {
      content: VerificationHistoryItem[];
      currentPage: number;
      size: number;
      hasNext: boolean;
      first: boolean;
      last: boolean;
    };
  };
}

/**
 * 타인 사용자 참가중인 챌린지 목록 응답
 */
export interface OtherUserOngoingChallengesResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: OngoingChallengeItem[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 타인 사용자 정보 조회
 */
export const getUserById = async (userId: number): Promise<OtherUser> => {
  try {
    const response = await apiClient.get<OtherUserResponse>(`/api/v1/user/${userId}`);
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '타인 사용자 정보를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 타인 사용자 인증 기록 조회
 */
export const getVerificationHistoryById = async (
  userId: number,
  page: number = 1,
  size: number = 20
): Promise<OtherUserVerificationHistoryResponse['result']> => {
  try {
    const response = await apiClient.get<OtherUserVerificationHistoryResponse>(
      `/api/v1/user/${userId}/verifications/history`,
      {
        params: { page, size },
      }
    );
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '타인 사용자 인증 기록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 타인 사용자 참가중인 챌린지 목록 조회
 */
export const getOngoingChallengesById = async (
  userId: number,
  page: number = 1,
  size: number = 10
): Promise<OtherUserOngoingChallengesResponse['result']> => {
  try {
    const response = await apiClient.get<OtherUserOngoingChallengesResponse>(
      `/api/v1/user/${userId}/challenge/ongoing`,
      {
        params: { page, size },
      }
    );
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '타인 사용자의 참가중인 챌린지를 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 사용자 차단 관련
 * ============================================
 */

/**
 * 사용자 차단 API 응답
 */
export interface BlockUserResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: string; // "User blocked successfully" or similar
}

/**
 * 사용자 차단
 */
export const blockUserById = async (blockedId: number): Promise<BlockUserResponse['result']> => {
  try {
    const response = await apiClient.post<BlockUserResponse>(`/api/v1/blocks/${blockedId}`);
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '사용자 차단에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 사용자 차단 해제 API 응답
 */
export interface UnblockUserResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: string; // "User unblocked successfully" or similar
}

/**
 * 사용자 차단 해제
 */
export const unblockUserById = async (blockedId: number): Promise<UnblockUserResponse['result']> => {
  try {
    const response = await apiClient.delete<UnblockUserResponse>(`/api/v1/blocks/${blockedId}`);
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '사용자 차단 해제에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * ============================================
 * 사용자 신고 관련
 * ============================================
 */

/**
 * 신고 사유 타입
 */
export type ReportReason =
  | 'ABUSIVE_LANGUAGE'         // 욕설/비속어 사용
  | 'SEXUAL_OR_OBSCENE'        // 성희롱/음란 발언
  | 'SPAM_OR_SCAM'             // 스팸/도배
  | 'PERSONAL_INFO_REQUEST'    // 개인정보 노출 요구
  | 'ILLEGAL_CONTENT_SHARE'    // 불법/유해 콘텐츠 공유
  | 'OTHER';                     // 기타(직접 입력)

/**
 * 신고 요청
 */
export interface ReportRequest {
  targetId: number;
  reason: ReportReason;
  description: string;
}

/**
 * 신고 응답
 */
export interface ReportResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {};
}

/**
 * 사용자 신고
 */
export const reportUserById = async (data: ReportRequest): Promise<void> => {
  try {
    console.log('reportUserById 함수로 전달된 데이터:', data); // Add this line
    const response = await apiClient.post<ReportResponse>(
      '/api/v1/report/user',
      data
    );

    if (!response.data.isSuccess) {
      console.error('사용자 신고 실패 응답:', response.data);
      throw new Error(response.data.message || '사용자 신고에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('사용자 신고 API 호출 중 에러 발생:', error);
    throw error;
  }
};

/**
 * ============================================
 * 찜한/종료된 챌린지 관련
 * ============================================
 */

/**
 * 챌린지 아이템
 */
export interface ChallengeItem {
  challengeId: number;
  title: string;
  description: string;
  image: string;
}

/**
 * 챌린지 목록 응답
 */
export interface ChallengeListResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: ChallengeItem[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 찜한 챌린지 목록 조회
 */
export const getLikedChallenges = async (page: number = 1, size: number = 10): Promise<ChallengeListResponse['result']> => {
  try {
    const response = await apiClient.get<ChallengeListResponse>(
      '/api/v1/user/challenges/liked',
      {
        params: { page, size },
      }
    );
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '찜한 챌린지 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 종료된 챌린지 목록 조회
 */
export const getCompletedChallenges = async (page: number = 1, size: number = 10): Promise<ChallengeListResponse['result']> => {
  try {
    const response = await apiClient.get<ChallengeListResponse>(
      '/api/v1/user/challenges/completed',
      {
        params: { page, size },
      }
    );
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new Error(response.data.message || '종료된 챌린지 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

