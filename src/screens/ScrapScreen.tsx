import React, { useCallback, useRef, useState } from 'react';
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
import {
  getScrappedVerifications,
  ScrappedVerificationItem,
} from '../libs/api/user';
import { scale, verticalScale } from '../utils/scaling';
import TextPlaceholderIcon from '../../assets/icons/text.svg';

type ScrapTab = ScrappedVerificationItem['type'];

const PAGE_SIZE = 20;
const TABS = [
  { key: 'CAMERA', label: '사진인증' },
  { key: 'TEXT', label: '글인증' },
];

const ScrapScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<ScrapTab>('CAMERA');
  const [items, setItems] = useState<ScrappedVerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentPageRef = useRef(1);
  const hasNextRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(async (
    page: number,
    mode: 'initial' | 'more' | 'refresh' = 'initial'
  ) => {
    if (requestInFlightRef.current && mode !== 'initial') return;

    const requestId = ++requestIdRef.current;
    requestInFlightRef.current = true;
    setError(null);
    if (mode === 'initial') {
      setItems([]);
      setIsLoading(true);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
    if (mode === 'more') setIsLoadingMore(true);
    if (mode === 'refresh') setIsRefreshing(true);

    try {
      const pageResult = await getScrappedVerifications(activeTab, page, PAGE_SIZE);
      if (requestId !== requestIdRef.current) return;
      setItems((previous) => page === 1
        ? pageResult.content
        : [...previous, ...pageResult.content]
      );
      currentPageRef.current = pageResult.currentPage;
      hasNextRef.current = pageResult.hasNext;
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError('스크랩한 인증 글을 불러오지 못했어요');
      if (page === 1) setItems([]);
    } finally {
      if (requestId === requestIdRef.current) {
        requestInFlightRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      hasNextRef.current = false;
      fetchPage(1);
      return () => {
        // 이전 탭/화면에서 시작한 응답이 현재 목록을 덮어쓰지 않도록 합니다.
        requestIdRef.current += 1;
        requestInFlightRef.current = false;
      };
    }, [fetchPage])
  );

  const loadNextPage = useCallback(() => {
    if (!hasNextRef.current || requestInFlightRef.current) return;
    fetchPage(currentPageRef.current + 1, 'more');
  }, [fetchPage]);

  const openDetail = useCallback((verificationId: number) => {
    navigation.navigate('ChallengeCertificationDetail', { verificationId });
  }, [navigation]);

  const renderPhotoItem = useCallback(({
    item,
    index,
  }: ListRenderItemInfo<ScrappedVerificationItem>) => {
    const thumbnailUrl = item.imageUrl;

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
  }: ListRenderItemInfo<ScrappedVerificationItem>) => {
    const record: CertificationRecordItem = {
      id: item.verificationId,
      title: item.title,
      challengeTitle: '',
      description: item.content ?? '',
      date: item.createdDate,
      type: item.type,
      thumbnailUrl: item.imageUrl,
      metaIcon: 'link',
      hasLink: item.hasLink,
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
        data={items}
        keyExtractor={(item) => String(item.verificationId)}
        numColumns={activeTab === 'CAMERA' ? 3 : 1}
        renderItem={activeTab === 'CAMERA' ? renderPhotoItem : renderTextItem}
        contentContainerStyle={[
          activeTab === 'CAMERA' ? styles.photoList : styles.textList,
          items.length === 0 && styles.emptyList,
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
