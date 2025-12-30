import { Challenge } from '../../store/challengeSlice';

const createChallenge = (id: number, overrides: Partial<Challenge>): Challenge => ({
  id: `challenge-${id}`,
  title: `챌린지 ${id}`,
  category: '운동',
  thumbnail: `https://picsum.photos/seed/${id}/200/200`,
  progress: Math.random(),
  verified: Math.random() > 0.5,
  participants: Math.floor(Math.random() * 1000),
  cadence: '매일',
  ...overrides,
});

const participatingChallenges: Challenge[] = [
  createChallenge(1, { title: '매일 30분 달리기', category: '운동' }),
  createChallenge(2, { title: '알고리즘 문제 풀기', category: '학업' }),
  createChallenge(3, { title: '아침 6시 기상', category: '생활습관' }),
];

const popularChallenges: Challenge[] = [
  createChallenge(101, { title: '주 3회 헬스장 가기', participants: 1203 }),
  createChallenge(102, { title: 'TOEIC 단어 100개 외우기', participants: 987 }),
  createChallenge(103, { title: '1일 1커밋', participants: 854 }),
  createChallenge(104, { title: '미라클 모닝', participants: 765 }),
  createChallenge(105, { title: '매일 책 20페이지 읽기', participants: 654 }),
];

const notifications = [
  { id: '1', message: '챌린지 인증 시간입니다.' },
  { id: '2', message: '새로운 챌린지가 추가되었습니다.' },
];

const categories = [
  { id: 'all', name: '전체보기' },
  { id: 'exercise', name: '운동' },
  { id: 'study', name: '학업' },
  { id: 'hobby', name: '취미' },
  { id: 'job', name: '취업준비' },
  { id: 'lifestyle', name: '생활습관' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getParticipatingChallenges: async (): Promise<Challenge[]> => {
    await delay(400);
    return participatingChallenges;
  },
  getPopularChallenges: async (): Promise<Challenge[]> => {
    await delay(400);
    return popularChallenges;
  },
  getNotifications: async () => {
    await delay(400);
    return notifications;
  },
  getCategories: async () => {
    await delay(400);
    return categories;
  },
};
