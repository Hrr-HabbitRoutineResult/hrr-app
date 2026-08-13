import { AxiosError } from 'axios';
import { apiClient } from './client';

interface ApiResponse<T> {
  isSuccess: boolean;
  status: string;
  code: string;
  message: string;
  result: T;
}

export interface RankingProfileDto {
  nickname: string;
  profileImage: string | null;
  points: number;
}

export interface RankingEntryDto {
  userId: number;
  rank: number;
  nickname: string;
  profileImage: string | null;
  points: number;
}

export interface RankingBoardDto {
  myRank: number | null;
  totalUserCount: number | null;
  topPercent: number | null;
  rankChange: number | null;
  rankChangeMessage: string | null;
  myPoints: number | null;
  topRankers: RankingEntryDto[];
  snapshotDate: string;
}

export interface RankingResultDto {
  myProfile: RankingProfileDto;
  board: RankingBoardDto | null;
}

export type PointType =
  | 'FIRST_VERIFICATION'
  | 'RANDOM_MISSION'
  | 'FLAWLESS_ROUND'
  | 'CHALLENGE_MASTER'
  | 'WEEK1_PERFECT'
  | 'WEEK2_PERFECT'
  | 'WEEK3_PERFECT';

export interface PointHistoryDto {
  pointType: PointType;
  title: string;
  detail: string | null;
  points: number;
  createdAt: string;
}

export interface PointHistoryResultDto {
  totalPoints: number;
  history: {
    content: PointHistoryDto[];
    currentPage: number;
    size: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
  };
}

export class RankingApiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'RankingApiError';
  }
}

const toRankingApiError = (error: unknown): RankingApiError => {
  const axiosError = error as AxiosError<Partial<ApiResponse<unknown>>>;
  const data = axiosError.response?.data;
  return new RankingApiError(
    data?.message ?? '랭킹 정보를 불러오지 못했습니다.',
    data?.code,
  );
};

export const getWeeklyRanking = async (): Promise<RankingResultDto> => {
  try {
    const response = await apiClient.get<ApiResponse<RankingResultDto>>(
      '/api/v1/ranking',
    );
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    }
    throw new RankingApiError(response.data.message, response.data.code);
  } catch (error) {
    if (error instanceof RankingApiError) throw error;
    throw toRankingApiError(error);
  }
};

export const getPointHistory = async (
  page: number,
  size: number,
): Promise<PointHistoryResultDto> => {
  const response = await apiClient.get<ApiResponse<PointHistoryResultDto>>(
    '/api/v1/point/history',
    { params: { page, size } },
  );
  if (response.data.isSuccess && response.data.result) {
    return response.data.result;
  }
  throw new Error(
    response.data.message || '포인트 내역을 불러오지 못했습니다.',
  );
};
