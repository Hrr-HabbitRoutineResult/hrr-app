import { create } from 'zustand';

type UserState = {
  nickname: string | null;
  randomMissionCompleted: boolean;
  setNickname: (nickname: string) => void;
  setRandomMissionCompleted: (completed: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  nickname: '게스트', // 초기 닉네임
  randomMissionCompleted: false, // 초기값
  setNickname: (nickname) => set({ nickname }),
  setRandomMissionCompleted: (completed) => set({ randomMissionCompleted: completed }),
}));

export const selectNickname = (state: UserState) => state.nickname;
export const selectRandomMissionCompleted = (state: UserState) => state.randomMissionCompleted;