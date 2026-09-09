import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import CertificationRecordList, {
  CertificationRecordItem,
} from '../components/MyPage/CertificationRecordList';
import { colors } from '../design/tokens';
import { format } from '../libs/format';
import {
  getVerificationHistoryById,
  getVerificationHistoryPage,
  VerificationHistoryItem,
} from '../libs/api/user';
import { scale, verticalScale } from '../utils/scaling';

type CertificationHistoryScreenRouteProp = RouteProp<RootStackParamList, 'CertificationHistory'>;

const PAGE_SIZE = 20;

const CertificationHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<CertificationHistoryScreenRouteProp>();
  const userId = route.params?.userId;
  const isMe = !userId;

  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPageRef = useRef(1);
  const hasNextRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const fetchPage = useCallback(async (page: number, mode: 'initial' | 'more' | 'refresh' = 'initial') => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setError(null);
    if (mode === 'initial') setIsLoading(true);
    if (mode === 'more') setIsLoadingMore(true);
    if (mode === 'refresh') setIsRefreshing(true);

    try {
      const pageResult = isMe
        ? await getVerificationHistoryPage(page, PAGE_SIZE)
        : (await getVerificationHistoryById(userId, page, PAGE_SIZE)).verifications;

      setHistory((previous) => page === 1 ? pageResult.content : [...previous, ...pageResult.content]);
      currentPageRef.current = pageResult.currentPage;
      hasNextRef.current = pageResult.hasNext;
    } catch {
      setError('인증기록을 불러오지 못했어요');
      if (page === 1) setHistory([]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [isMe, userId]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      hasNextRef.current = false;
      fetchPage(1);
    }, [fetchPage])
  );

  const certificationItems: CertificationRecordItem[] = useMemo(() => (
    history.map((item) => ({
      id: item.verificationId,
      title: item.title,
      challengeTitle: item.challengeTitle,
      date: format.date(item.verifiedAt),
      type: item.type,
      originalPhotoUrl: item.originalPhotoUrl,
      thumbnailUrl: item.photoUrl ||
        (item.type === 'TEXT' && item.textImages?.length ? item.textImages[0] : null),
    }))
  ), [history]);

  const loadNextPage = useCallback(() => {
    if (!hasNextRef.current || requestInFlightRef.current) return;
    fetchPage(currentPageRef.current + 1, 'more');
  }, [fetchPage]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      );
    }

    if (error) {
      return (
        <TouchableOpacity style={styles.stateContainer} activeOpacity={0.8} onPress={() => fetchPage(1)}>
          <Text variant="xsReg" color={colors.text.tertiary}>{error}</Text>
          <Text variant="xxs" color={colors.primary.main} style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <Text variant="xsReg" color={colors.text.tertiary}>인증기록이 아직 없어요</Text>
        <Text variant="xxs" color={colors.text.tertiary} style={styles.emptyDescription}>
          챌린지에서 글을 올려보세요
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="인증기록"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider
        horizontalPadding={20}
      />
      <FlatList
        data={certificationItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          certificationItems.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <CertificationRecordList
            items={[item]}
            onItemPress={(record) => navigation.navigate('ChallengeCertificationDetail', {
              verificationId: record.id,
            })}
          />
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={isLoadingMore ? (
          <ActivityIndicator style={styles.footerLoader} color={colors.primary.main} />
        ) : null}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.35}
        refreshing={isRefreshing}
        onRefresh={() => fetchPage(1, 'refresh')}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(32),
  },
  emptyListContent: {
    flexGrow: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    marginTop: verticalScale(8),
  },
  emptyDescription: {
    marginTop: verticalScale(2),
  },
  footerLoader: {
    marginVertical: verticalScale(16),
  },
});

export default CertificationHistoryScreen;
