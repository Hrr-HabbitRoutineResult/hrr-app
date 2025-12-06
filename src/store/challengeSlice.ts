import { create } from 'zustand';
import { getDailyTopChallenges, DailyTopChallengeItem } from '../libs/api/challenge';

type ChallengeState = {
  dailyTop: DailyTopChallengeItem[];
  dailyTop10: DailyTopChallengeItem[];
  isLoading: boolean;
  isLoading10: boolean;
  error: string | null;
  error10: string | null;
  fetchDailyTop: (count?: number) => Promise<void>;
};

export const useChallengeStore = create<ChallengeState>((set) => ({
  dailyTop: [],
  dailyTop10: [],
  isLoading: false,
  isLoading10: false,
  error: null,
  error10: null,

  // 오늘의 인기 챌린지 목록 조회 (기본 3개, 10개 조회 가능)
  fetchDailyTop: async (count = 3) => {
    const isTop10 = count === 10;
    const loadingKey = isTop10 ? 'isLoading10' : 'isLoading';
    const errorKey = isTop10 ? 'error10' : 'error';
    const dataKey = isTop10 ? 'dailyTop10' : 'dailyTop';

    set({ [loadingKey]: true, [errorKey]: null } as any);
    try {
      const data = await getDailyTopChallenges(count);
      set({ [dataKey]: data, [loadingKey]: false } as any);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '오늘의 인기 챌린지를 불러오는데 실패했습니다.';
      set({ [errorKey]: errorMessage, [loadingKey]: false } as any);
    }
  },
}));
