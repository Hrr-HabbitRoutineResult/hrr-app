import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoGray from '../../assets/images/logo-gray.svg';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import { PointCriteriaRow } from '../components/ranking/PointCriteriaRow';
import { RankingLoadError } from '../components/ranking/RankingLoadError';
import { colors } from '../design/tokens';
import { pointService } from '../services/ranking';
import { PointHistoryItem } from '../types/ranking';
import { formatPoints } from '../utils/number';
import { scale, verticalScale } from '../utils/scaling';

const PAGE_SIZE = 20;

const PointHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const loadingMoreRef = useRef(false);

  const loadPointHistory = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const page = await pointService.getHistoryPage(1, PAGE_SIZE);
      setTotalPoints(page.totalPoints);
      setHistory(page.items);
      setCurrentPage(page.currentPage);
      setHasNext(page.hasNext);
      setLoadMoreError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPointHistory();
  }, []);

  const loadNextPage = async (isRetry = false) => {
    if (!hasNext || loadingMoreRef.current || (loadMoreError && !isRetry))
      return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const page = await pointService.getHistoryPage(
        currentPage + 1,
        PAGE_SIZE,
      );
      setTotalPoints(page.totalPoints);
      setHistory(previous => [...previous, ...page.items]);
      setCurrentPage(page.currentPage);
      setHasNext(page.hasNext);
    } catch {
      setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const handleScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const distanceFromEnd =
      nativeEvent.contentSize.height -
      nativeEvent.layoutMeasurement.height -
      nativeEvent.contentOffset.y;
    if (distanceFromEnd < verticalScale(120)) {
      loadNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="포인트 누적 현황"
        onBack={() => navigation.goBack()}
        showDivider
        horizontalPadding={20}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : loadError ? (
        <RankingLoadError
          message="포인트 내역을 불러오지 못했어요"
          onRetry={loadPointHistory}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.balance}>
            <Text variant="xsMd" color={colors.text.primary}>
              현재 보유 중인 포인트는?
            </Text>
            <Text
              variant="header2"
              color={colors.primary.sub}
              style={styles.balanceValue}
            >
              {formatPoints(totalPoints)}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text variant="header4" color={colors.text.primary}>
              포인트 내역
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              포인트 내역은 최대 3개월까지 확인할 수 있어요
            </Text>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <LogoGray width={scale(104)} height={verticalScale(96)} />
              <Text
                variant="xsReg"
                color={colors.icon.gray}
                style={styles.emptyText}
              >
                아직 적립된 포인트 내역이 없어요
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {history.map(item => (
                <PointCriteriaRow
                  key={item.id}
                  type={item.type}
                  title={item.title}
                  description={item.detail}
                  points={item.points}
                />
              ))}
              {loadingMore ? (
                <ActivityIndicator
                  style={styles.pageLoader}
                  color={colors.primary.main}
                />
              ) : null}
              {loadMoreError ? (
                <TouchableOpacity
                  style={styles.loadMoreRetry}
                  onPress={() => loadNextPage(true)}
                  testID="point-history-load-more-retry"
                >
                  <Text variant="xsMd" color={colors.primary.main}>
                    내역을 더 불러오지 못했어요. 다시 시도
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  balance: {
    minHeight: verticalScale(88),
    borderRadius: scale(20),
    backgroundColor: colors.background,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    justifyContent: 'center',
    marginBottom: verticalScale(32),
  },
  balanceValue: {
    marginTop: verticalScale(2),
  },
  sectionHeader: {
    gap: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  list: {
    paddingBottom: verticalScale(12),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(72),
  },
  emptyText: {
    marginTop: verticalScale(18),
  },
  pageLoader: {
    marginVertical: verticalScale(16),
  },
  loadMoreRetry: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
});

export default PointHistoryScreen;
