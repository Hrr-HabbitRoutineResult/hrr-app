export interface RankEntry {
  userId: string;
  rank: number;
  nickname: string;
  avatarUrl?: string;
  points: number;
}

export interface WeeklyRanking {
  myRank: number | null;
  myPoints: number;
  snapshotPoints: number | null;
  totalUserCount: number | null;
  topPercent: number | null;
  rankDelta: number | null;
  rankChangeMessage: string | null;
  snapshotDate: string | null;
  top5: RankEntry[];
  me?: RankEntry;
}

export type PointCriteriaType =
  | 'FIRST_VERIFICATION'
  | 'RANDOM_MISSION'
  | 'FLAWLESS_ROUND'
  | 'CHALLENGE_MASTER'
  | 'WEEK1_PERFECT'
  | 'WEEK2_PERFECT'
  | 'WEEK3_PERFECT';

export interface PointCriteria {
  type: PointCriteriaType;
  title: string;
  description?: string;
  points: number;
}

export interface PointHistoryItem {
  id: string;
  type: PointCriteriaType;
  title: string;
  detail?: string;
  points: number;
  createdAt: string;
}

export interface PointHistoryPage {
  totalPoints: number;
  items: PointHistoryItem[];
  currentPage: number;
  hasNext: boolean;
}
