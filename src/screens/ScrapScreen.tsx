import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../components/common/Header';
import { TabBar } from '../components/common/TabBar';
import { Text } from '../components/common/Text';
import CertificationRecordList, {
  CertificationRecordItem,
} from '../components/MyPage/CertificationRecordList';
import { colors } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../store/userSlice';
import {
  getScrappedVerifications,
  VerificationHistoryItem,
} from '../libs/api/user';
import { format } from '../libs/format';
import { scale, verticalScale } from '../utils/scaling';
import TextPlaceholderIcon from '../../assets/icons/text.svg';

type ScrapTab = VerificationHistoryItem['type'];

const PAGE_SIZE = 20;
const TABS = [
  { key: 'CAMERA', label: '사진인증' },
  { key: 'TEXT', label: '글인증' },
];

const ScrapScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userInfo, fetchUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState<ScrapTab>('CAMERA');
  const [items, setItems] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPageRef = useRef(1);
  const hasNextRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const fetchPage = useCallback(async (
    page: number,
    mode: 'initial' | 'more' | 'refresh' = 'initial'
  ) => {
    if (requestInFlightRef.current) return;

    let userId = userInfo?.userId;
    if (!userId) {
      await fetchUserInfo();
      userId = useUserStore.getState().userInfo?.userId;
    }

    if (!userId) {
      setError('사용자 정보를 불러오지 못했어요');
      setIsLoading(false);
      return;
    }

    requestInFlightRef.current = true;
    setError(null);
    if (mode === 'initial') setIsLoading(true);
    if (mode === 'more') setIsLoadingMore(true);
    if (mode === 'refresh') setIsRefreshing(true);

    try {
      const pageResult = await getScrappedVerifications(userId, page, PAGE_SIZE);
      setItems((previous) => page === 1
        ? pageResult.content
        : [...previous, ...pageResult.content]
      );
      currentPageRef.current = pageResult.currentPage;
      hasNextRef.current = pageResult.hasNext;
    } catch {
      setError('스크랩한 인증 글을 불러오지 못했어요');
      if (page === 1) setItems([]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [fetchUserInfo, userInfo?.userId]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      hasNextRef.current = false;
      fetchPage(1);
    }, [fetchPage])
  );

  const filteredItems = useMemo(
    () => items.filter((item) => item.type === activeTab),
    [activeTab, items]
  );

  const loadNextPage = useCallback(() => {
    if (!hasNextRef.current || requestInFlightRef.current) return;
    fetchPage(currentPageRef.current + 1, 'more');
  }, [fetchPage]);

  useEffect(() => {
    if (!isLoading && !error && filteredItems.length === 0 && hasNextRef.current) {
      loadNextPage();
    }
  }, [error, filteredItems.length, isLoading, loadNextPage]);

  const openDetail = useCallback((verificationId: number) => {
    navigation.navigate('ChallengeCertificationDetail', { verificationId });
  }, [navigation]);

  const renderPhotoItem = useCallback(({
    item,
    index,
  }: ListRenderItemInfo<VerificationHistoryItem>) => {
    const thumbnailUrl = item.photoUrl || item.textImages?.[0] || null;

    return (
      <TouchableOpacity
        style={[
          styles.photoItem,
          index % 3 !== 2 && styles.photoItemGap,
        ]}
        activeOpacity={0.8}
        onPress={() => openDetail(item.verificationId)}
      >
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <TextPlaceholderIcon width="100%" height="100%" />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [openDetail]);

  const renderTextItem = useCallback(({
    item,
  }: ListRenderItemInfo<VerificationHistoryItem>) => {
    const record: CertificationRecordItem = {
      id: item.verificationId,
      title: item.title,
      challengeTitle: item.challengeTitle,
      description: item.content || item.challengeTitle,
      date: format.date(item.verifiedAt),
      type: item.type,
      thumbnailUrl: item.textImages?.[0] || item.photoUrl || null,
      metaIcon: 'link',
      hasLink: Boolean(item.textUrl),
    };

    return (
      <CertificationRecordList
        items={[record]}
        variant="scrap"
        onItemPress={(pressedRecord) => openDetail(pressedRecord.id)}
      />
    );
  }, [openDetail]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      );
    }

    if (error) {
      return (
        <TouchableOpacity
          style={styles.stateContainer}
          activeOpacity={0.8}
          onPress={() => fetchPage(1)}
        >
          <Text variant="xsReg" color={colors.text.tertiary}>{error}</Text>
          <Text variant="xxs" color={colors.primary.main} style={styles.retryText}>
            다시 시도
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <Text variant="xsReg" color={colors.text.tertiary}>
          스크랩한 {activeTab === 'CAMERA' ? '사진' : '글'} 인증이 아직 없어요
        </Text>
      </View>
    );
  }, [activeTab, error, fetchPage, isLoading]);

  return (
    <View style={styles.container}>
      <Header
        title="스크랩"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider
        horizontalPadding={14}
        verticalPadding={14}
      />
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as ScrapTab)}
        topPadding={verticalScale(11)}
      />
      <FlatList
        key={activeTab}
        data={filteredItems}
        keyExtractor={(item) => String(item.verificationId)}
        numColumns={activeTab === 'CAMERA' ? 3 : 1}
        renderItem={activeTab === 'CAMERA' ? renderPhotoItem : renderTextItem}
        contentContainerStyle={[
          activeTab === 'CAMERA' ? styles.photoList : styles.textList,
          filteredItems.length === 0 && styles.emptyList,
        ]}
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
  photoList: {
    paddingTop: 0,
    paddingBottom: verticalScale(32),
  },
  photoItem: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: '33.333333%',
    overflow: 'hidden',
    backgroundColor: colors.button,
  },
  photoItemGap: {
    marginRight: scale(3),
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: colors.button,
  },
  textList: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(32),
  },
  emptyList: {
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
  footerLoader: {
    marginVertical: verticalScale(16),
  },
});

export default ScrapScreen;
