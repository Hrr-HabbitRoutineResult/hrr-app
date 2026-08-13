import AsyncStorage from '@react-native-async-storage/async-storage';
import { POINT_CRITERIA } from '../constants/points';
import {
  getPointHistory,
  getWeeklyRanking,
  RankingApiError,
} from '../libs/api/ranking';
import {
  PointCriteria,
  PointHistoryPage,
  WeeklyRanking,
} from '../types/ranking';

export { RankingApiError };

export const rankingService = {
  async getWeeklyRanking(): Promise<WeeklyRanking> {
    const [result, storedUserId] = await Promise.all([
      getWeeklyRanking(),
      AsyncStorage.getItem('userId'),
    ]);
    const { board, myProfile } = result;
    if (!board) {
      return {
        myRank: null,
        myPoints: myProfile.points,
        snapshotPoints: null,
        totalUserCount: null,
        topPercent: null,
        rankDelta: null,
        rankChangeMessage: null,
        snapshotDate: null,
        top5: [],
      };
    }
    const top5 = board.topRankers
      .slice(0, 5)
      .map(entry => ({
        userId: String(entry.userId),
        rank: entry.rank,
        nickname: entry.nickname,
        avatarUrl: entry.profileImage ?? undefined,
        points: entry.points,
      }));

    const myUserId = storedUserId ?? undefined;
    const meInTop5 = myUserId
      ? top5.find(entry => entry.userId === myUserId)
      : undefined;
    const me =
      meInTop5 ??
      (myUserId && board.myRank !== null && board.myPoints !== null
        ? {
            userId: myUserId,
            rank: board.myRank,
            nickname: myProfile.nickname,
            avatarUrl: myProfile.profileImage ?? undefined,
            points: board.myPoints,
          }
        : undefined);

    return {
      myRank: board.myRank,
      myPoints: myProfile.points,
      snapshotPoints: board.myPoints,
      totalUserCount: board.totalUserCount,
      topPercent: board.topPercent,
      rankDelta: board.rankChange,
      rankChangeMessage: board.rankChangeMessage,
      snapshotDate: board.snapshotDate,
      top5,
      me,
    };
  },
};

export const pointService = {
  async getHistoryPage(page: number, size: number): Promise<PointHistoryPage> {
    const result = await getPointHistory(page, size);
    return {
      totalPoints: result.totalPoints,
      currentPage: result.history.currentPage,
      hasNext: result.history.hasNext,
      items: result.history.content.map((item, index) => ({
        id: `${page}:${index}:${item.createdAt}:${item.pointType}`,
        type: item.pointType,
        title: item.title,
        detail: item.detail ?? undefined,
        points: item.points,
        createdAt: item.createdAt,
      })),
    };
  },
  async getCriteria(): Promise<PointCriteria[]> {
    return POINT_CRITERIA;
  },
};
