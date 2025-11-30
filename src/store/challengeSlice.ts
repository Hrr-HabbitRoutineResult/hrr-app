import { create } from 'zustand';
import { mockApi } from '../libs/api/mock';

export type Challenge = {
  id: string;
  title: string;
  category: 'all' | '운동' | '학업' | '취미' | '취업준비' | '생활습관';
  thumbnail: string;
  progress: number;
  todayEligible: boolean;
  participants: number;
  cadence: string;
};

type ChallengeState = {
  participating: Challenge[];
  popular: Challenge[];
  isLoading: boolean;
  error: string | null;
  fetchParticipating: () => Promise<void>;
  fetchPopular: () => Promise<void>;
};

export const useChallengeStore = create<ChallengeState>((set) => ({
  participating: [],
  popular: [],
  isLoading: false,
  error: null,
  fetchParticipating: async () => {
    set({ isLoading: true, error: null });
    try {
      const participating = await mockApi.getParticipatingChallenges();
      set({ participating, isLoading: false });
    } catch (error) {
      set({ error: '참여중인 챌린지를 불러오는데 실패했습니다.', isLoading: false });
    }
  },
  fetchPopular: async () => {
    set({ isLoading: true, error: null });
    try {
      const popular = await mockApi.getPopularChallenges();
      set({ popular, isLoading: false });
    } catch (error) {
      set({ error: '인기 챌린지를 불러오는데 실패했습니다.', isLoading: false });
    }
  },
}));
