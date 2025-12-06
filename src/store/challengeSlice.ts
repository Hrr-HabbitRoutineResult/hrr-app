import { create } from 'zustand';
import { getDailyTopChallenges, DailyTopChallengeItem } from '../libs/api/challenge';

type ChallengeState = {
  dailyTop: DailyTopChallengeItem[];
  isLoading: boolean;
  error: string | null;
  fetchDailyTop: () => Promise<void>;
};

export const useChallengeStore = create<ChallengeState>((set) => ({
  dailyTop: [],
  isLoading: false,
  error: null,
  fetchDailyTop: async () => {
    set({ isLoading: true, error: null });
    try {
      const dailyTop = await getDailyTopChallenges(3);
      set({ dailyTop, isLoading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '오늘의 인기 챌린지를 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
