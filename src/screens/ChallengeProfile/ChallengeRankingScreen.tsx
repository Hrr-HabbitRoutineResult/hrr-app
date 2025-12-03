import React from 'react';
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
import DefaultProfileIcon from '../../../assets/icons/challenge-profile/default-profile.svg';
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
              <DefaultProfileIcon width={32} height={32} />
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
              <DefaultProfileIcon width={80} height={80} />
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
              <DefaultProfileIcon width={80} height={80} />
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
              <DefaultProfileIcon width={80} height={80} />
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
                <DefaultProfileIcon width={40} height={40} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  // 내 프로필 + 탑3 랭킹
  topRankingBox: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  myProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 15,
  },
  profileImageContainer: {
    width: 32,
    height: 32,
  },
  myNickname: {
    marginRight: -5,
  },
  myRank: {
    marginLeft: 'auto',
  },
  dot: {
    marginRight: -5,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.primary,
  },
  // 랭킹 탑3 컨테이너
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 0,
    paddingHorizontal: 0,
    minHeight: 200, // 막대 그래프 공간 확보
    gap: 16,
  },
  topThreeItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  topThreeNickname: {
    marginTop: 12,
    marginBottom: 4,
  },
  topThreeScore: {
    marginBottom: 12,
  },
  // 막대 그래프
  barChart: {
    width: 80,
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
    height: 1,
    backgroundColor: colors.line,
    marginBottom: 20,
  },
  // 순위 리스트 박스
  rankingListBox: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingRight: 20,
    paddingLeft: 10,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 24,
  },
  // 순위 리스트
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
  },
  rankingLeft: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    marginBottom: 4,
    textAlign: 'center',
  },
  rankIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    width: 40,
    height: 40,
    marginLeft: -5,
  },
  rankingNickname: {
    flex: 1,
  },
  rankingScore: {
    textAlign: 'right',
  },
});

