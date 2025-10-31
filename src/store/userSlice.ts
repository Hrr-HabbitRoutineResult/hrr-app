import { create } from 'zustand';

type UserState = {
  nickname: string | null;
  setNickname: (nickname: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  nickname: '게스트', // 초기 닉네임
  setNickname: (nickname) => set({ nickname }),
}));

export const selectNickname = (state: UserState) => state.nickname;
