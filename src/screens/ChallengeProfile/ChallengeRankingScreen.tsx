import React from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text } from '../../components/common/Text';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { ProfileImage } from '../../components/common/ProfileImage';
import RankUpIcon from '../../../assets/icons/challenge-profile/rank-up.svg';
import RankDownIcon from '../../../assets/icons/challenge-profile/rank-down.svg';
import RankNewIcon from '../../../assets/icons/challenge-profile/rank-new.svg';
import RankSameIcon from '../../../assets/icons/challenge-profile/rank-same.svg';

type ChallengeRankingScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeRanking'>;
type ChallengeRankingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChallengeRanking'>;

// TODO: API 연동 시 실제 데이터로 교체
const mockMyRanking = {
  rank: 29,
  nickname: '해빗',
  score: 52,
  trend: 'same' as const, // 'up' | 'down' | 'new' | 'same'
};

const mockRankings = [
  { rank: 1, nickname: '헤더', score: 156, trend: 'up' as const },
  { rank: 2, nickname: '라인', score: 102, trend: 'down' as const },
  { rank: 3, nickname: '리니', score: 89, trend: 'new' as const },
  { rank: 4, nickname: '해빗', score: 89, trend: 'same' as const },
  { rank: 5, nickname: '나루', score: 86, trend: 'up' as const },
  { rank: 6, nickname: '이든', score: 52, trend: 'up' as const },
  { rank: 7, nickname: '사용자7', score: 50, trend: 'down' as const },
  { rank: 8, nickname: '사용자8', score: 48, trend: 'same' as const },
  { rank: 9, nickname: '사용자9', score: 45, trend: 'new' as const },
  { rank: 10, nickname: '사용자10', score: 42, trend: 'up' as const },
];

const getRankTrendIcon = (trend: 'up' | 'down' | 'new' | 'same') => {
  switch (trend) {
    case 'up':
      return <RankUpIcon width={8} height={6} />;
    case 'down':
      return <RankDownIcon width={8} height={6} />;
    case 'new':
      return <RankNewIcon width={16} height={6} />;
    case 'same':
      return <RankSameIcon width={8} height={1} />;
  }
};

export const ChallengeRankingScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeRankingScreenNavigationProp>();
  const route = useRoute<ChallengeRankingScreenRouteProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="챌린지 랭킹"
        onBack={() => navigation.goBack()}
        showDivider
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 상위 박스: 내 프로필 + 1~3위 랭킹 */}
        <View style={styles.topRankingBox}>
          {/* 내 프로필 영역 */}
          <View style={styles.myProfileSection}>
            <View style={styles.profileImageContainer}>
              <ProfileImage size={scale(32)} />
            </View>
            <Text variant="smMd" color={colors.text.primary} style={styles.myNickname}>
              {mockMyRanking.nickname}
            </Text>
            <View style={styles.dot} />
            <Text variant="smReg" color={colors.text.tertiary}>
              챌린저
            </Text>
            <Text variant="smMd" color={colors.text.primary} style={styles.myRank}>
              {mockMyRanking.rank}위
            </Text>
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 랭킹 TOP3 표시 */}
          <View style={styles.topThreeContainer}>
            {/* 2위 (왼쪽) */}
            <View style={styles.topThreeItem}>
              <ProfileImage size={scale(80)} />
              <Text variant="header2" color={colors.text.primary} style={styles.topThreeNickname}>
                {mockRankings[1].nickname}
              </Text>
              <Text variant="xsReg" color={colors.text.tertiary} style={styles.topThreeScore}>
                {mockRankings[1].score}
              </Text>
              {/* TODO: 막대 그래프 높이 계산 로직 구현 필요
                  현재는 피그마를 기준으로 하드코딩된 값 사용 */}
              <View
                style={[
                  styles.barChart,
                  styles.barChart2nd,
                  { height: 112 },
                ]}
              />
            </View>

            {/* 1위 (가운데) */}
            <View style={styles.topThreeItem}>
              <ProfileImage size={scale(80)} />
              <Text variant="header2" color={colors.text.primary} style={styles.topThreeNickname}>
                {mockRankings[0].nickname}
              </Text>
              <Text variant="xsReg" color={colors.text.tertiary} style={styles.topThreeScore}>
                {mockRankings[0].score}
              </Text>
              <View style={[styles.barChart, styles.barChart1st, { height: 156 }]} />
            </View>

            {/* 3위 (오른쪽) */}
            <View style={styles.topThreeItem}>
              <ProfileImage size={scale(80)} />
              <Text variant="header2" color={colors.text.primary} style={styles.topThreeNickname}>
                {mockRankings[2].nickname}
              </Text>
              <Text variant="xsReg" color={colors.text.tertiary} style={styles.topThreeScore}>
                {mockRankings[2].score}
              </Text>
              <View
                style={[
                  styles.barChart,
                  styles.barChart3rd,
                  { height: 84 },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 순위 리스트 박스: 1위부터 10위까지 */}
        <View style={styles.rankingListBox}>
          {mockRankings.map((item) => (
            <View key={item.rank} style={styles.rankingItem}>
              <View style={styles.rankingLeft}>
                <Text variant="smMd" color={colors.text.tertiary} style={styles.rankNumber}>
                  {item.rank}
                </Text>
                <View style={styles.rankIconContainer}>
                  {getRankTrendIcon(item.trend)}
                </View>
              </View>
              <View style={styles.profileContainer}>
                <ProfileImage size={scale(40)} />
              </View>
              <Text variant="md" color={colors.text.primary} style={styles.rankingNickname}>
                {item.nickname}
              </Text>
              <Text variant="smReg" color={colors.text.tertiary} style={styles.rankingScore}>
                {item.score}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    gap: scale(12),
  },
  // 내 프로필 + 탑3 랭킹
  topRankingBox: {
    backgroundColor: colors.white,
    borderRadius: scale(10),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  myProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    paddingBottom: verticalScale(15),
  },
  profileImageContainer: {
    width: scale(32),
    height: verticalScale(32),
  },
  myNickname: {
    marginRight: -5,
  },
  myRank: {
    marginLeft: 'auto',
  },
  dot: {
    marginRight: -5,
    width: scale(2),
    height: verticalScale(2),
    borderRadius: scale(1),
    backgroundColor: colors.text.primary,
  },
  // 랭킹 탑3 컨테이너
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: verticalScale(0),
    paddingHorizontal: scale(0),
    minHeight: 200, // 막대 그래프 공간 확보
    gap: scale(16),
  },
  topThreeItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(0),
  },
  topThreeNickname: {
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
  },
  topThreeScore: {
    marginBottom: verticalScale(12),
  },
  // 막대 그래프
  barChart: {
    width: scale(80),
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    minHeight: 20,
  },
  barChart1st: {
    backgroundColor: colors.primary.main,
  },
  barChart2nd: {
    backgroundColor: colors.primary.light,
  },
  barChart3rd: {
    backgroundColor: colors.primary.lighter,
  },
  divider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
    marginBottom: verticalScale(20),
  },
  // 순위 리스트 박스
  rankingListBox: {
    backgroundColor: colors.white,
    borderRadius: scale(10),
    paddingRight: scale(20),
    paddingLeft: scale(10),
    paddingVertical: verticalScale(14),
    gap: scale(10),
    marginBottom: verticalScale(24),
  },
  // 순위 리스트
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    height: verticalScale(40),
  },
  rankingLeft: {
    width: scale(40),
    height: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  rankIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    width: scale(40),
    height: verticalScale(40),
    marginLeft: -5,
  },
  rankingNickname: {
    flex: 1,
  },
  rankingScore: {
    textAlign: 'right',
  },
});
