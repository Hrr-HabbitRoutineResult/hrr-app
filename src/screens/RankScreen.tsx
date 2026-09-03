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
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Line, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MoreIcon from '../../assets/icons/chevron-right-grey.svg';
import { PointCriteriaSheet } from '../components/ranking/PointCriteriaSheet';
import { RankList } from '../components/ranking/RankList';
import { RankingLoadError } from '../components/ranking/RankingLoadError';
import { Text } from '../components/common/Text';
import { colors } from '../design/tokens';
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
  <Svg width={scale(82)} height={verticalScale(68)} viewBox="0 0 82 68">
    {rising ? (
      <>
        <Line
          x1="54"
          y1="32"
          x2="76"
          y2="6"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.75"
        />
        <Line
          x1="54"
          y1="32"
          x2="82"
          y2="21"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.72"
        />
        <Line
          x1="54"
          y1="32"
          x2="82"
          y2="42"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.68"
        />
        <Line
          x1="54"
          y1="32"
          x2="73"
          y2="65"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.6"
        />
        <Line
          x1="54"
          y1="32"
          x2="46"
          y2="67"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.55"
        />
        <Line
          x1="54"
          y1="32"
          x2="26"
          y2="61"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.5"
        />
        <Path d="M43 52H64V28H75L58 10L41 28H52V40H43V52Z" fill="#FF5F56" />
      </>
    ) : (
      <Path d="M41 16H62V40H73L56 58L39 40H50V28H41V16Z" fill="#B8C0CF" />
    )}
  </Svg>
);

const RankScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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
        <Text variant="xsMd" color={colors.text.primary}>
          {ranking.topPercent === null
            ? '이번 주 랭킹 집계 전이에요'
            : `현재 상위 ${formatNumber(ranking.topPercent)}%예요`}
        </Text>
        {ranking.rankChangeMessage ? (
          <Text
            variant="caption"
            color={colors.text.primary}
            style={styles.statusDescription}
          >
            {ranking.rankChangeMessage}
          </Text>
        ) : null}
      </View>
      {ranking.rankDelta === null ? null : <TrendGraphic rising={isRising} />}
    </>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: verticalScale(104),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="header3"
          color={colors.text.primary}
          style={styles.title}
        >
          랭킹
        </Text>

        <View style={styles.myRank}>
          <Text variant="smMd" color={colors.text.primary}>
            이번 주 내 순위
          </Text>
          <Text
            variant="header2"
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
          >
            <Text variant="caption" color={colors.text.tertiary}>
              보유포인트
            </Text>
            <MoreIcon width={scale(12)} height={scale(12)} />
          </TouchableOpacity>
        </View>

        {isRising ? (
          <LinearGradient
            colors={['#FFF1F0', '#FFE2E0']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.statusCard}
          >
            {statusContent}
          </LinearGradient>
        ) : (
          <View style={[styles.statusCard, styles.statusCardDown]}>
            {statusContent}
          </View>
        )}

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
  },
  title: {
    marginBottom: verticalScale(24),
  },
  myRank: {
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  myRankValue: {
    marginTop: verticalScale(4),
  },
  pointsRow: {
    minHeight: verticalScale(24),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    marginTop: verticalScale(1),
  },
  statusCard: {
    height: verticalScale(80),
    borderRadius: scale(20),
    paddingLeft: scale(18),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  statusCardDown: {
    backgroundColor: colors.line,
  },
  statusTextWrap: {
    flex: 1,
    zIndex: 1,
  },
  statusDescription: {
    marginTop: verticalScale(1),
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
