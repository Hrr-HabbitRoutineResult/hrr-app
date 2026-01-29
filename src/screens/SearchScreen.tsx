import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scaling';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, HomeTabParamList } from '../navigation/types';
import { colors, typography } from '../design/tokens';
import { Text } from '../components/common/Text';
import SectionHeader from '../components/common/SectionHeader';
import { getChallenges, ChallengeInfo, trackChallengeClick } from '../libs/api/challenge';
import { getPopularKeywords, incrementSearchCount } from '../libs/api/search';
import ChallengeItem from '../components/common/ChallengeItem';
import LogoGray from '../../assets/images/logo-gray.svg';
import BackIcon from '../../assets/icons/back.svg';
import SearchIcon from '../../assets/icons/search.svg';
import DeleteIcon from '../../assets/icons/delete.svg';
import DeleteCircleIcon from '../../assets/icons/delete-circle.svg';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList, '검색'>,
  StackNavigationProp<RootStackParamList>
>;

const RECENT_SEARCHES_KEY = 'recentSearches'; // CategorySearchScreen과 공유
const MAX_RECENT_SEARCHES = 20;

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 여부
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChallengeInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  // 뒤로가기 (인기 검색어 모드로 복귀)
  const handleBackToPopular = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setShouldAutoFocus(false);
  }, []);

  const topPadding = Platform.OS === 'android' ? verticalScale(18) : verticalScale(10);
  const bottomPadding = verticalScale(4);
  const safeAreaTop = Platform.OS === 'android' ? Math.max(insets.top, verticalScale(24)) : insets.top;

  // 인기 검색어 불러오기 함수
  const loadPopularKeywords = async () => {
    try {
      const response = await getPopularKeywords();
      if (response.isSuccess && Array.isArray(response.result)) {
        setPopularSearches(response.result);
      }
    } catch (error) {
      // 인기 검색어 불러오기 실패
    }
  };

  // AsyncStorage에서 최근 검색어 불러오기
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        }
      } catch (error) {
        // 최근 검색어 불러오기 실패
      }
    };

    loadRecentSearches();
  }, []);

  // 화면이 포커스될 때마다 인기 검색어 새로 불러오기
  useFocusEffect(
    useCallback(() => {
      loadPopularKeywords();
    }, [])
  );

  // 검색 탭을 다시 누르면 초기 화면으로 리셋
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // 현재 화면이 포커스된 상태에서 검색 탭을 누른 경우
      if (navigation.isFocused()) {
        handleBackToPopular();
      }
    });

    return unsubscribe;
  }, [navigation, handleBackToPopular]);

  // 최근 검색어를 AsyncStorage에 저장
  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      // 최근 검색어 저장 실패
    }
  };

  // 요일 파싱 함수
  const parseDaysOfWeek = (daysData: string | string[]) => {
    try {
      let days: string[] = [];

      if (Array.isArray(daysData)) {
        days = daysData;
      } else if (typeof daysData === 'string') {
        const validJson = daysData.replace(/'/g, '"');
        days = JSON.parse(validJson);
      }

      if (Array.isArray(days)) {
        if (days.length === 7) return '매일';

        const dayMap: Record<string, string> = {
          MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목',
          FRIDAY: '금', SATURDAY: '토', SUNDAY: '일'
        };

        return days.map(d => dayMap[d] || d).join(' / ');
      }
      return '매일';
    } catch (e) {
      return '매일';
    }
  };

  // 검색어 삭제 함수
  const handleDeleteSearch = async (index: number) => {
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
    await saveRecentSearches(updated);
  };

  // 검색 입력 필드 초기화 함수
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // 검색 API 호출
  const handleSearch = async (query?: string) => {
    const searchTerm = query !== undefined ? query : (searchQuery || '');
    const trimmedQuery = typeof searchTerm === 'string' ? searchTerm.trim() : '';

    if (!trimmedQuery) {
      return;
    }

    if (query !== undefined) {
      setSearchQuery(query);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // 검색 카운트 증가 API 호출 (성공 시 인기 검색어 갱신)
      incrementSearchCount(trimmedQuery)
        .then(() => {
          // 인기 검색어 목록 갱신 (서버에서 1시간 단위로 업데이트됨)
          loadPopularKeywords();
        })
        .catch(() => {
          // 검색 카운트 증가 실패 (검색 기능은 정상적으로 동작)
        });

      // 페이지네이션: hasNext가 true면 다음 페이지 계속 요청
      let allChallenges: ChallengeInfo[] = [];
      let currentPage = 1;
      let hasNext = true;

      while (hasNext) {
        const searchParams = {
          title: trimmedQuery,
          page: currentPage,
          size: 20,
        };

        const result = await getChallenges(searchParams);
        allChallenges = [...allChallenges, ...result.content];

        hasNext = result.hasNext;
        currentPage++;
      }

      setSearchResults(allChallenges);

      // 최근 검색어 저장
      const updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await saveRecentSearches(updated);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 인기 검색어 클릭 핸들러
  const handlePopularSearchClick = (keyword: string) => {
    setShouldAutoFocus(false); // 자동 포커스 끄기
    setIsSearchMode(true);
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  // 인기 검색어 두 그룹으로 나누기 (1-5위, 6-10위)
  const leftColumn = popularSearches.slice(0, 5);
  const rightColumn = popularSearches.slice(5, 10);

  // 검색 모드일 때 UI
  if (isSearchMode) {
    return (
      <View style={styles.searchModeContainer}>
        {/* 검색 헤더 */}
        <View style={[
          styles.searchHeader,
          {
            paddingTop: safeAreaTop + topPadding,
            paddingBottom: bottomPadding,
          }
        ]}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            onPress={handleBackToPopular}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackIcon width={9} height={18} />
          </TouchableOpacity>

          {/* 검색 입력 필드 */}
          <View style={[styles.searchInputContainer, styles.searchInputContainerActive]}>
            <View style={styles.searchIconContainer}>
              <SearchIcon width={12} height={15.77} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="찾으시는 검색 내용이 있나요?"
              placeholderTextColor={colors.icon.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoFocus={shouldAutoFocus}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <DeleteCircleIcon width={12} height={12} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 검색 결과 또는 최근 검색어 섹션 */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            hasSearched && searchResults.length === 0 && !isSearching && styles.whiteBackground
          ]}
        >
          {hasSearched ? (
            // 검색 결과 표시
            <>
              {isSearching ? (
                <View style={styles.emptyContainer}>
                  <Text variant="smReg" color={colors.text.tertiary}>
                    검색 중...
                  </Text>
                </View>
              ) : searchResults.length > 0 ? (
                <View style={styles.resultsContainer}>
                  {searchResults.map((challenge, index) => {
                    const daysText = parseDaysOfWeek(challenge.daysOfWeek);
                    const isLast = index === searchResults.length - 1;

                    return (
                      <ChallengeItem
                        key={challenge.challengeId}
                        challengeId={challenge.challengeId}
                        thumbnailUrl={challenge.thumbnailUrl}
                        title={challenge.title}
                        description={challenge.description}
                        daysText={daysText}
                        currentParticipantCount={challenge.currentParticipantCount}
                        maxParticipantCount={challenge.maxParticipantCount}
                        ddayUntilStart={challenge.ddayUntilStart}
                        onPress={() => {
                          trackChallengeClick(challenge.challengeId);
                          navigation.navigate('ChallengeProfile', { challengeId: challenge.challengeId });
                        }}
                        marginBottom={isLast ? 0 : 8}
                        marginHorizontal={0}
                      />
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <LogoGray width={124.16} height={119.79} />
                  <Text style={styles.emptyText}>
                    검색어에 맞는 결과가 없어요
                  </Text>
                </View>
              )}
            </>
          ) : (
            // 최근 검색어 표시
            <View style={styles.recentSearchContainer}>
              <Text variant="header4" color={colors.text.primary} style={styles.sectionTitle}>
                최근 검색어
              </Text>
              {recentSearches.length > 0 ? (
                <View style={styles.searchList}>
                  {recentSearches.map((search, index) => (
                    <View key={index} style={styles.searchItem}>
                      <TouchableOpacity
                        style={styles.searchItemContent}
                        onPress={() => handleSearch(search)}
                      >
                        <Text variant="smReg" color={colors.text.primary} style={styles.searchText}>
                          {search}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteSearch(index)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <DeleteIcon width={12} height={12} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text variant="smReg" color={colors.icon.gray}>
                  최근 검색어가 없습니다
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // 인기 검색어 모드일 때 UI (초기 진입 화면)
  return (
    <View style={styles.container}>
      <SectionHeader title="검색" isScreenHeader />

      {/* 검색 필드 */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => {
          setIsSearchMode(true);
          setShouldAutoFocus(true); // 검색 필드를 직접 클릭할 경우에만 포커스
        }}
        activeOpacity={0.8}
      >
        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconContainer}>
            <SearchIcon width={12} height={15.77} />
          </View>
          <Text variant="smReg" color={colors.icon.gray} style={styles.searchPlaceholder}>
            찾으시는 검색 내용이 있나요?
          </Text>
        </View>
      </TouchableOpacity>

      {/* 인기 검색어 섹션 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.popularSearchSection}>
          <Text variant="header3" color={colors.text.primary} style={styles.popularTitle}>
            인기 검색어
          </Text>

          <View style={styles.popularListContainer}>
            {/* 왼쪽 열 (1-5위) */}
            <View style={styles.column}>
              {leftColumn.map((keyword, index) => (
                <TouchableOpacity
                  key={`left-${index}`}
                  style={styles.popularItem}
                  onPress={() => handlePopularSearchClick(keyword)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rankContainer}>
                    <Text variant="header4" color={colors.primary.main}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text variant="xsReg" color={colors.text.primary} style={styles.keywordText}>
                    {keyword}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 오른쪽 열 (6-10위) */}
            <View style={styles.column}>
              {rightColumn.map((keyword, index) => (
                <TouchableOpacity
                  key={`right-${index}`}
                  style={styles.popularItem}
                  onPress={() => handlePopularSearchClick(keyword)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rankContainer}>
                    <Text variant="header4" color={colors.primary.main}>
                      {index + 6}
                    </Text>
                  </View>
                  <Text variant="xsReg" color={colors.text.primary} style={styles.keywordText}>
                    {keyword}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    backgroundColor: colors.white,
  },
  backButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  searchModeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: scale(20),
    backgroundColor: colors.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(44),
  },
  searchInputContainerActive: {
    flex: 1,
  },
  searchIconContainer: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    ...typography.smReg,
    color: colors.text.primary,
    padding: 0,
  },
  searchPlaceholder: {
    flex: 1,
    padding: 0,
  },
  clearButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100), // 하단 네비게이션 바 여유 공간
  },
  popularSearchSection: {
    marginTop: verticalScale(32),
  },
  popularTitle: {
    marginBottom: verticalScale(21),
  },
  popularListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    gap: verticalScale(10),
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keywordText: {
    marginLeft: scale(10),
    lineHeight: moderateScale(13),
  },
  resultsContainer: {
    marginTop: verticalScale(24),
  },
  recentSearchContainer: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    marginBottom: verticalScale(16),
  },
  searchList: {
    marginLeft: scale(4),
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
  },
  searchItemContent: {
    flex: 1,
  },
  searchText: {
    flex: 1,
  },
  deleteButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(228),
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    marginTop: verticalScale(32),
  },
  whiteBackground: {
    backgroundColor: colors.white,
    flex: 1,
  },
});

export default SearchScreen;
