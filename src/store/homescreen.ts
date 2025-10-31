import { atom } from 'recoil';

export const currentPageAtom = atom<number>({
  key: 'currentPageAtom',
  default: 0,
});
