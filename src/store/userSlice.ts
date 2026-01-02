import { create } from 'zustand';
import { getOngoingChallenges, OngoingChallengeItem, getVerificationHistory, VerificationHistoryItem } from '../libs/api/user';

type UserState = {
  nickname: string | null;
  randomMissionCompleted: boolean;
  myOngoingChallenges: OngoingChallengeItem[];
  isLoadingMyOngoingChallenges: boolean;
  errorMyOngoingChallenges: string | null;
  myVerificationHistory: VerificationHistoryItem[];
  isLoadingMyVerificationHistory: boolean;
  errorMyVerificationHistory: string | null;
  setNickname: (nickname: string) => void;
  setRandomMissionCompleted: (completed: boolean) => void;
  fetchMyOngoingChallenges: () => Promise<void>;
  fetchMyVerificationHistory: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  nickname: '게스트', // 초기 닉네임
  randomMissionCompleted: false, // 초기값
  myOngoingChallenges: [],
  isLoadingMyOngoingChallenges: false,
  errorMyOngoingChallenges: null,
  myVerificationHistory: [],
  isLoadingMyVerificationHistory: false,
  errorMyVerificationHistory: null,
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
}));

export const selectNickname = (state: UserState) => state.nickname;
export const selectRandomMissionCompleted = (state: UserState) => state.randomMissionCompleted;