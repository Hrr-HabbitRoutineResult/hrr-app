// src/store/user.ts
import { atom, selector } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AtomEffect } from "recoil";

/** AsyncStorage 퍼시스트 공통 효과 */
const persist =
  <T,>(key: string): AtomEffect<T> =>
  ({ setSelf, onSet, trigger }) => {
    const load = async () => {
      const saved = await AsyncStorage.getItem(key);
      if (saved != null) setSelf(JSON.parse(saved));
    };
    if (trigger === "get") load();

    onSet(async (newVal, _, isReset) => {
      if (isReset) await AsyncStorage.removeItem(key);
      else await AsyncStorage.setItem(key, JSON.stringify(newVal));
    });
  };

/** 기본 유저 아톰들 */
export const nicknameAtom = atom<string | null>({
  key: "nicknameAtom",
  default: null,
  effects: [persist("nickname")],
});

export type Gender = "male" | "female" | "other" | null;

export const genderAtom = atom<Gender>({
  key: "genderAtom",
  default: null,
  effects: [persist("gender")],
});

export const ageGroupAtom = atom<string | null>({
  key: "ageGroupAtom",
  default: null,
  effects: [persist("ageGroup")],
});

export const jobAtom = atom<string | null>({
  key: "jobAtom",
  default: null,
  effects: [persist("job")],
});

export const isDarkModeAtom = atom<boolean>({
  key: "isDarkModeAtom",
  default: false,
  effects: [persist("isDarkMode")],
});

/** 파생 상태(예: 상단 인사 문구) */
export const greetingSelector = selector<string>({
  key: "greetingSelector",
  get: ({ get }) => {
    const nick = get(nicknameAtom);
    return nick ? `${nick}님 안녕하세요` : "안녕하세요";
  },
});