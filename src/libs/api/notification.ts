import { apiClient } from './client';

/**
 * ============================================
 * 알림 관련
 * ============================================
 */

/**
 * 알림 아이템
 */
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  imageUrl: string;
  category: 'CHALLENGE' | 'VERIFICATION' | 'FOLLOW' | 'BADGE';
  type:
    | 'CHALLENGE_EXTENSION'
    | 'CHALLENGE_EXTENSION_SUCCESS'
    | 'CHALLENGE_EXTENSION_CANCEL'
    | 'VERIFICATION_DEADLINE_3H'
    | 'VERIFICATION_DEADLINE_1H'
    | 'VERIFICATION_DEADLINE_NOW'
    | string;
  targetType:
    | 'CHALLENGE'
    | 'VERIFICATION'
    | 'COMMENT'
    | 'USER'
    | 'BADGE'
    | 'ROUND'; // 화면 이동을 위한 타입
  targetId: number;
  contextType:
    | 'CHALLENGE'
    | 'VERIFICATION'
    | 'COMMENT'
    | 'USER'
    | 'BADGE'
    | 'ROUND'; // 추가 처리를 위한 타입
  contextId: number;
  isRead: boolean;
  isResponded: boolean; // 챌린지 연장 여부에 응답했는지 여부
  createdAt: string;
}

/**
 * 알림 목록 조회 요청 파라미터
 */
export interface GetNotificationsParams {
  category?: 'CHALLENGE' | 'VERIFICATION' | 'FOLLOW' | 'BADGE';
  page?: number;
  size?: number;
}

/**
 * 알림 목록 조회 응답
 */
export interface GetNotificationsResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    content: NotificationItem[];
    currentPage: number;
    size: number;
    hasNext: boolean;
    first: boolean;
    last: boolean;
  };
}

/**
 * 알림 목록 조회
 */
export const getNotifications = async (
  params?: GetNotificationsParams,
): Promise<GetNotificationsResponse['result']> => {
  try {
    const response = await apiClient.get<GetNotificationsResponse>(
      '/api/v1/notifications',
      {
        params: {
          category: params?.category,
          page: params?.page ?? 1,
          size: params?.size ?? 10,
        },
      },
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(
      response.data.message || '알림 목록을 불러오는데 실패했습니다.',
    );
  } catch (error: any) {
    throw error;
  }
};

/**
 * 알림 읽음 처리 응답
 */
export interface MarkNotificationAsReadResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    notificationId: number;
    isRead: boolean;
  };
}

/**
 * 알림 읽음 처리
 */
export const markNotificationAsRead = async (
  notificationId: number,
): Promise<MarkNotificationAsReadResponse['result']> => {
  try {
    const response = await apiClient.patch<MarkNotificationAsReadResponse>(
      `/api/v1/notifications/${notificationId}/read`,
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(response.data.message || '알림 읽음 처리에 실패했습니다.');
  } catch (error: any) {
    throw error;
  }
};

/**
 * 읽지 않은 알림 상태 조회 응답
 */
export interface GetUnreadStatusResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: {
    hasUnread: boolean;
  };
}

/**
 * FCM 토큰 요청/응답 공통 타입
 */
interface FcmTokenRequest {
  userId: number;
  fcmToken: string;
}

interface FcmTokenResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
}

/**
 * FCM 토큰 등록
 */
export const registerFcmToken = async (
  userId: number,
  fcmToken: string,
): Promise<void> => {
  console.log('[API] POST /api/v1/fcm/token 요청 시작');

  try {
    const response = await apiClient.post<FcmTokenResponse>(
      '/api/v1/fcm/token',
      { userId, fcmToken } satisfies FcmTokenRequest,
    );

    console.log('[API] 응답 상태:', response.status);
    console.log('[API] 응답 body:', response.data);

    if (!response.data.isSuccess) {
      console.error('[API] ❌ 서버 오류:', response.data.message);
      throw new Error(response.data.message || 'FCM 토큰 등록에 실패했습니다.');
    }

    console.log('[API] ✅ FCM 토큰 등록 성공');
  } catch (error: any) {
    console.error(
      '[API] ❌ 요청 실패:',
      error?.response?.status,
      error?.message || error,
    );
    throw error;
  }
};

/**
 * FCM 토큰 비활성화 (로그아웃 시 호출)
 */
export const deactivateFcmToken = async (
  userId: number,
  fcmToken: string,
): Promise<void> => {
  const response = await apiClient.patch<FcmTokenResponse>(
    '/api/v1/fcm/token',
    { userId, fcmToken } satisfies FcmTokenRequest,
  );

  if (!response.data.isSuccess) {
    throw new Error(
      response.data.message || 'FCM 토큰 비활성화에 실패했습니다.',
    );
  }
};

/**
 * 알림 수신 설정
 */
export interface NotificationSettings {
  isAllPaused: boolean;
  isChallengeEnabled: boolean;
  isVerificationEnabled: boolean;
  isFollowEnabled: boolean;
  isBadgeEnabled: boolean;
}

interface NotificationSettingsResponse {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: NotificationSettings;
}

/**
 * 알림 수신 설정 조회
 */
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const response = await apiClient.get<NotificationSettingsResponse>(
      '/api/v1/notifications/settings',
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }

    throw new Error(
      response.data.message || '알림 설정을 불러오는데 실패했습니다.',
    );
  };

/**
 * 알림 수신 설정 변경
 */
export const updateNotificationSettings = async (
  settings: NotificationSettings,
): Promise<NotificationSettings> => {
  const response = await apiClient.patch<NotificationSettingsResponse>(
    '/api/v1/notifications/settings',
    settings,
  );

  if (response.data.isSuccess && response.data.result) {
    return response.data.result;
  }

  throw new Error(response.data.message || '알림 설정 변경에 실패했습니다.');
};

/**
 * 읽지 않은 알림 상태 조회
 */
export const getUnreadStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<GetUnreadStatusResponse>(
      '/api/v1/notifications/unread-status',
    );

    if (response.data.isSuccess && response.data.result) {
      return response.data.result.hasUnread;
    }

    return false;
  } catch (error: any) {
    // 에러가 발생해도 조용히 false 반환
    return false;
  }
};
