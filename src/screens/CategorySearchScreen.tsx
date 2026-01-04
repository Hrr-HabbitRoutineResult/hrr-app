import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../design/tokens';
import { Text } from '../components/common/Text';
import { getChallenges, ChallengeInfo, trackChallengeClick } from '../libs/api/challenge';
import ChallengeItem from '../components/common/ChallengeItem';
import LogoGray from '../../assets/images/logo-gray.svg';
import BackIcon from '../../assets/icons/back.svg';
import SearchIcon from '../../assets/icons/search.svg';
import DeleteIcon from '../../assets/icons/delete.svg';
import DeleteCircleIcon from '../../assets/icons/delete-circle.svg';

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 20;

type CategorySearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CategorySearchScreen = () => {
  const navigation = useNavigation<CategorySearchScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChallengeInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 검색 헤더 전용 패딩 
  const topPadding = Platform.OS === 'android' ? verticalScale(18) : verticalScale(10);
  const bottomPadding = verticalScale(4);
  const safeAreaTop = Platform.OS === 'android' ? Math.max(insets.top, verticalScale(24)) : insets.top;

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
    // 검색어 결정: query가 있으면 사용, 없으면 searchQuery 사용
    const searchTerm = query !== undefined ? query : (searchQuery || '');
    const trimmedQuery = typeof searchTerm === 'string' ? searchTerm.trim() : '';

    if (!trimmedQuery) {
      return;
    }

    // 검색어를 state에 설정 (최근 검색어 클릭 시)
    if (query !== undefined) {
      setSearchQuery(query);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchParams = {
        title: trimmedQuery,
        page: 1,
        size: 20,
      };

      const result = await getChallenges(searchParams);
      setSearchResults(result.content);

      // 최근 검색어에 추가 (중복 제거, 최신순 유지)
      const updated = [
        trimmedQuery,
        ...recentSearches.filter(item => item !== trimmedQuery)
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      await saveRecentSearches(updated);
    } catch (error: any) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[
        styles.header,
        {
          paddingTop: safeAreaTop + topPadding,
          paddingBottom: bottomPadding,
        }
      ]}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <BackIcon width={9} height={18} />
        </TouchableOpacity>

        {/* 검색 입력 필드 */}
        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconContainer}>
            <SearchIcon width={12} height={15.77} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="찾으시는 챌린지가 있나요?"
            placeholderTextColor={colors.icon.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus={false}
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
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
                <TouchableOpacity
                  style={styles.createChallengeButton}
                  onPress={() => {
                    navigation.navigate('CreateChallengeQ1');
                  }}
                  activeOpacity={0.8}
                >
                  <Text variant="md" color={colors.white}>
                    챌린지 개설하기
                  </Text>
                </TouchableOpacity>
                <Text style={styles.emptyText}>
                  검색어에 맞는 챌린지가 없어요{'\n'}원하는 챌린지를 개설해 보세요!
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
                      activeOpacity={0.7}
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
                      <DeleteIcon width={8} height={8} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text variant="smReg" color={colors.text.tertiary}>
                  최근 검색어가 없습니다
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    backgroundColor: colors.white,
  },
  backButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(44),
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
    paddingTop: verticalScale(24),
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(40),
  },
  resultsContainer: {
    gap: 0,
  },
  recentSearchContainer: {
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
    paddingTop: verticalScale(150),
  },
  createChallengeButton: {
    height: verticalScale(44),
    backgroundColor: colors.text.primary,
    borderRadius: scale(40),
    paddingHorizontal: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(32),
    marginBottom: verticalScale(10),
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    lineHeight: verticalScale(21),
    marginTop: verticalScale(16),
  },
});

export default CategorySearchScreen;
