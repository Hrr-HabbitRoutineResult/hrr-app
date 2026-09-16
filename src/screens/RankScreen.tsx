import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MoreIcon from '../../assets/icons/chevron-left-medium-ic-grey.svg';
import TrendRiseBackground from '../../assets/icons/ranking/trend-rise-background.svg';
import TrendRise from '../../assets/icons/ranking/trend-rise.svg';
import TrendFall from '../../assets/icons/ranking/trend-fall.svg';
import { PointCriteriaSheet } from '../components/ranking/PointCriteriaSheet';
import { RankList } from '../components/ranking/RankList';
import { RankingLoadError } from '../components/ranking/RankingLoadError';
import { Text } from '../components/common/Text';
import SectionHeader from '../components/common/SectionHeader';
import { colors, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import {
  pointService,
  rankingService,
  RankingApiError,
} from '../services/ranking';
import { PointCriteria, WeeklyRanking } from '../types/ranking';
import { formatNumber } from '../utils/number';
import { scale, verticalScale } from '../utils/scaling';

type RankScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TrendGraphic: React.FC<{ rising: boolean }> = ({ rising }) => (
  <View style={styles.trendGraphic} pointerEvents="none" accessible={false}>
    {rising ? (
      <>
        <TrendRiseBackground
          width={scale(155.343)}
          height={scale(134.155)}
          style={styles.trendRiseBackground}
        />
        <TrendRise
          width={scale(47)}
          height={scale(45)}
          style={styles.trendRise}
        />
      </>
    ) : (
      <TrendFall
        width={scale(48)}
        height={scale(48)}
        style={styles.trendFall}
      />
    )}
  </View>
);

const RankScreen: React.FC = () => {
  const navigation = useNavigation<RankScreenNavigationProp>();
  const [ranking, setRanking] = useState<WeeklyRanking | null>(null);
  const [criteria, setCriteria] = useState<PointCriteria[]>([]);
  const [criteriaVisible, setCriteriaVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

  const loadRanking = async () => {
    setLoading(true);
    setLoadErrorMessage(null);
    try {
      const [rankingData, criteriaData] = await Promise.all([
        rankingService.getWeeklyRanking(),
        pointService.getCriteria(),
      ]);
      setRanking(rankingData);
      setCriteria(criteriaData);
    } catch (error) {
      if (error instanceof RankingApiError) {
        if (error.code === 'RANKING4041' || error.code === 'RANKING_EMPTY') {
          setLoadErrorMessage('아직 생성된 랭킹 정보가 없어요');
        } else if (error.code === 'RANKING4042') {
          setLoadErrorMessage('내 랭킹 정보를 찾을 수 없어요');
        } else {
          setLoadErrorMessage('랭킹 정보를 불러오지 못했어요');
        }
      } else {
        setLoadErrorMessage('랭킹 정보를 불러오지 못했어요');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  if (loadErrorMessage || !ranking) {
    return (
      <View style={styles.screen}>
        <RankingLoadError
          message={loadErrorMessage ?? '랭킹 정보를 불러오지 못했어요'}
          onRetry={loadRanking}
        />
      </View>
    );
  }

  const isRising = (ranking.rankDelta ?? 0) > 0;
  const statusContent = (
    <>
      <View style={styles.statusTextWrap}>
        <Text
          variant="smMd"
          color={colors.text.primary}
          style={styles.statusTitle}
        >
          {ranking.topPercent === null
            ? '이번 주 랭킹 집계 전이에요'
            : `현재 상위 ${formatNumber(ranking.topPercent)}%예요`}
        </Text>
        {ranking.rankChangeMessage ? (
          <Text
            variant="xxs"
            color={colors.text.primary}
            style={styles.statusDescription}
          >
            {ranking.rankChangeMessage}
          </Text>
        ) : null}
      </View>
      {ranking.rankDelta === null || ranking.rankDelta === 0 ? null : (
        <TrendGraphic rising={isRising} />
      )}
    </>
  );

  return (
    <View style={styles.screen}>
      <SectionHeader title="랭킹" isScreenHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: verticalScale(104),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.myRank}>
          <Text
            variant="header2"
            color={colors.text.primary}
            style={styles.myRankTitle}
          >
            이번 주 내 순위
          </Text>
          <Text
            variant="header1"
            color={colors.primary.sub}
            style={styles.myRankValue}
          >
            {ranking.myRank === null ? '-' : `${ranking.myRank}등`}
          </Text>
          <TouchableOpacity
            style={styles.pointsRow}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('PointHistory')}
            accessibilityRole="button"
            accessibilityLabel="보유포인트 확인"
            hitSlop={spacing.sm}
          >
            <Text
              variant="xsReg"
              color={colors.text.tertiary}
              style={styles.pointsLabel}
            >
              보유포인트
            </Text>
            <MoreIcon
              width={scale(20)}
              height={scale(20)}
              style={styles.pointsChevron}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.statusCard, !isRising && styles.statusCardDown]}>
          {statusContent}
        </View>

        <View style={styles.rankListWrap}>
          <RankList top5={ranking.top5} me={ranking.me} />
        </View>

        <TouchableOpacity
          style={styles.helpRow}
          onPress={() => setCriteriaVisible(true)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="포인트 적립 기준 보기"
        >
          <Text variant="caption" color={colors.text.tertiary}>
            포인트 적립 기준은 무엇인가요?
          </Text>
          <View style={styles.helpBadge}>
            <Text
              variant="caption"
              color={colors.icon.gray}
              style={styles.helpMark}
            >
              ?
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <PointCriteriaSheet
        visible={criteriaVisible}
        onClose={() => setCriteriaVisible(false)}
        criteria={criteria}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
  },
  myRank: {
    alignItems: 'center',
    marginBottom: scale(20),
  },
  myRankTitle: {
    fontSize: scale(20),
    lineHeight: scale(24),
  },
  myRankValue: {
    fontSize: scale(24),
    lineHeight: scale(29),
    marginTop: scale(12),
  },
  pointsRow: {
    minHeight: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    gap: scale(2),
    marginTop: scale(4),
  },
  pointsLabel: {
    fontSize: scale(13),
    lineHeight: scale(16),
  },
  pointsChevron: {
    transform: [{ scaleX: -1 }],
  },
  statusCard: {
    // Keep the Figma 350 × 80 proportions on every screen aspect ratio.
    minHeight: scale(80),
    borderRadius: scale(20),
    backgroundColor: colors.primary.lighter,
    paddingVertical: scale(22),
    paddingLeft: scale(21),
    paddingRight: scale(114),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(24),
  },
  statusCardDown: {
    backgroundColor: colors.line,
  },
  statusTextWrap: {
    flex: 1,
    zIndex: 1,
  },
  statusTitle: {
    fontSize: scale(15),
    lineHeight: scale(18),
  },
  statusDescription: {
    fontSize: scale(12),
    lineHeight: scale(14),
    marginTop: scale(4),
  },
  trendGraphic: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: scale(130),
    height: scale(80),
  },
  trendRiseBackground: {
    position: 'absolute',
    left: 0,
    top: -scale(16),
  },
  trendRise: {
    position: 'absolute',
    left: scale(55),
    top: scale(17),
  },
  trendFall: {
    position: 'absolute',
    left: scale(54),
    top: scale(16),
  },
  rankListWrap: {
    width: '100%',
  },
  helpRow: {
    minHeight: verticalScale(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(7),
    marginTop: 'auto',
  },
  helpBadge: {
    width: scale(15),
    height: scale(15),
    borderRadius: scale(8),
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpMark: {
    lineHeight: scale(13),
  },
});

export default RankScreen;
