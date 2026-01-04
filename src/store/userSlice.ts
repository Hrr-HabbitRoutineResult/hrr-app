import { create } from 'zustand';
import {
  getOngoingChallenges,
  OngoingChallengeItem,
  getVerificationHistory,
  VerificationHistoryItem,
  getUserMe,
  UserMe,
  getFollowers,
  getFollowings,
  followUser,
  unfollowUser,
  FollowItem,
  updateUserProfile,
  UpdateUserProfileRequest,
} from '../libs/api/user';

type UserState = {
  nickname: string | null;
  randomMissionCompleted: boolean;
  userInfo: UserMe | null;
  isLoadingUserInfo: boolean;
  errorUserInfo: string | null;
  myOngoingChallenges: OngoingChallengeItem[];
  isLoadingMyOngoingChallenges: boolean;
  errorMyOngoingChallenges: string | null;
  myVerificationHistory: VerificationHistoryItem[];
  isLoadingMyVerificationHistory: boolean;
  errorMyVerificationHistory: string | null;
  followers: FollowItem[];
  isLoadingFollowers: boolean;
  errorFollowers: string | null;
  followings: FollowItem[];
  isLoadingFollowings: boolean;
  errorFollowings: string | null;
  setNickname: (nickname: string) => void;
  setRandomMissionCompleted: (completed: boolean) => void;
  fetchMyOngoingChallenges: () => Promise<void>;
  fetchMyVerificationHistory: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  fetchFollowers: () => Promise<void>;
  fetchFollowings: () => Promise<void>;
  followUser: (userId: number) => Promise<void>;
  unfollowUser: (userId: number) => Promise<void>;
  updateUserInfo: (data: UpdateUserProfileRequest) => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  nickname: '게스트', // 초기 닉네임
  randomMissionCompleted: false, // 초기값
  userInfo: null,
  isLoadingUserInfo: false,
  errorUserInfo: null,
  myOngoingChallenges: [],
  isLoadingMyOngoingChallenges: false,
  errorMyOngoingChallenges: null,
  myVerificationHistory: [],
  isLoadingMyVerificationHistory: false,
  errorMyVerificationHistory: null,
  followers: [],
  isLoadingFollowers: false,
  errorFollowers: null,
  followings: [],
  isLoadingFollowings: false,
  errorFollowings: null,
  setNickname: (nickname) => set({ nickname }),
  setRandomMissionCompleted: (completed) => set({ randomMissionCompleted: completed }),

  fetchMyOngoingChallenges: async () => {
    set({ isLoadingMyOngoingChallenges: true, errorMyOngoingChallenges: null });
    try {
      const challenges = await getOngoingChallenges();
      set({ myOngoingChallenges: challenges, isLoadingMyOngoingChallenges: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '참가중인 챌린지를 불러오는데 실패했습니다.';
      set({ errorMyOngoingChallenges: errorMessage, isLoadingMyOngoingChallenges: false });
    }
  },

  fetchMyVerificationHistory: async () => {
    set({ isLoadingMyVerificationHistory: true, errorMyVerificationHistory: null });
    try {
      const history = await getVerificationHistory();
      set({ myVerificationHistory: history, isLoadingMyVerificationHistory: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '인증 기록을 불러오는데 실패했습니다.';
      set({ errorMyVerificationHistory: errorMessage, isLoadingMyVerificationHistory: false });
    }
  },

  fetchUserInfo: async () => {
    set({ isLoadingUserInfo: true, errorUserInfo: null });
    try {
      const userInfo = await getUserMe();
      set({ userInfo, nickname: userInfo.nickname, isLoadingUserInfo: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '사용자 정보를 불러오는데 실패했습니다.';
      set({ errorUserInfo: errorMessage, isLoadingUserInfo: false });
    }
  },

  fetchFollowers: async () => {
    set({ isLoadingFollowers: true, errorFollowers: null });
    try {
      const followers = await getFollowers();
      set({ followers, isLoadingFollowers: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '팔로워 목록을 불러오는데 실패했습니다.';
      set({ errorFollowers: errorMessage, isLoadingFollowers: false });
    }
  },

  fetchFollowings: async () => {
    set({ isLoadingFollowings: true, errorFollowings: null });
    try {
      const followings = await getFollowings();
      set({ followings, isLoadingFollowings: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '팔로잉 목록을 불러오는데 실패했습니다.';
      set({ errorFollowings: errorMessage, isLoadingFollowings: false });
    }
  },

  followUser: async (userId: number) => {
    try {
      await followUser(userId);
      get().fetchFollowers();
      get().fetchFollowings();
    } catch (error: any) {
      console.error("Follow failed:", error);
      throw error;
    }
  },

  unfollowUser: async (userId: number) => {
    try {
      await unfollowUser(userId);
      get().fetchFollowers();
      get().fetchFollowings();
    } catch (error: any) {
      console.error("Unfollow failed:", error);
      throw error;
    }
  },

  updateUserInfo: async (data: UpdateUserProfileRequest) => {
    set({ isLoadingUserInfo: true, errorUserInfo: null });
    try {
      // 1. 서버에 업데이트 요청을 보냅니다.
      await updateUserProfile(data);
      // 2. 업데이트 성공 시, 즉시 전체 사용자 프로필을 다시 가져옵니다.
      // 이를 통해 스토어는 항상 서버의 최신 정식 데이터를 갖게 됩니다.
      // fetchUserInfo 액션이 최종 상태 설정 및 isLoading을 false로 처리합니다.
      await get().fetchUserInfo();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || '프로필 업데이트에 실패했습니다.';
      // 실패 시 에러 상태를 설정하고 로딩 인디케이터를 끕니다.
      set({ errorUserInfo: errorMessage, isLoadingUserInfo: false });
      throw error; // 컴포넌트가 실패를 알 수 있도록 에러를 다시 던집니다.
    }
  },
}));

export const selectNickname = (state: UserState) => state.nickname;
export const selectRandomMissionCompleted = (state: UserState) => state.randomMissionCompleted;