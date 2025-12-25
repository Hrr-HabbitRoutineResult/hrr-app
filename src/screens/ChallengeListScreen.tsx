import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../design/tokens';
import { Header } from '../components/common/Header';
import { TabBar, TabItem } from '../components/common/TabBar';
import { BottomSheet } from '../components/common/BottomSheet';
import { DaySelector } from '../components/common/DaySelector';
import { SortSelector } from '../components/common/SortSelector';
import { Text as CustomText } from '../components/common/Text';
import ChallengeItem from '../components/common/ChallengeItem';
import { ChallengeInfo, getChallenges, trackChallengeClick } from '../libs/api/challenge';
import SearchTextPrimary from '../../assets/icons/search-text-primay.svg';
import CheckboxUnchecked from '../../assets/icons/checkbox-unchecked.svg';
import CheckboxChecked from '../../assets/icons/checkbox-checked.svg';
import CheckboxFilterUnchecked from '../../assets/icons/checkbox-filter-unchecked.svg';
import CheckboxFilterChecked from '../../assets/icons/checkbox-filter-checked.svg';
import ChevronDownTextPrimary from '../../assets/icons/chevron-down-text-primary.svg';
import ChevronDownWhite from '../../assets/icons/chevron-down-white.svg';
import LogoGray from '../../assets/images/logo-gray.svg';
import AddFab from '../../assets/icons/add-fab.svg';

type ChallengeListScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeList'>;

type Props = {
  route: ChallengeListScreenRouteProp;
};

// 카테고리 탭 정의
const categoryTabs: TabItem[] = [
  { key: 'all', label: 'ALL' },
  { key: 'exercise', label: '운동' },
  { key: 'study', label: '학업' },
  { key: 'hobby', label: '취미' },
  { key: 'job', label: '취업준비' },
  { key: 'lifestyle', label: '생활습관' },
];

// 카테고리 키를 API 카테고리 값으로 매핑
const mapCategoryToApi = (categoryKey: string): 'ALL' | 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT' => {
  const categoryMap: Record<string, 'ALL' | 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT'> = {
    'all': 'ALL',
    'exercise': 'HEALTH',
    'study': 'STUDY',
    'hobby': 'HOBBY',
    'job': 'CAREER',
    'lifestyle': 'HABIT',
  };
  return categoryMap[categoryKey] || 'ALL';
};

const ChallengeListScreen = ({ route }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { category, recommend } = route.params || {};

  // 초기 탭 설정: category가 있으면 해당 탭, 없으면 'all'
  const [activeTab, setActiveTab] = useState<string>(category || 'all');

  // 실제 적용된 필터 상태 (API 호출에 사용)
  const [appliedOnlyUpcoming, setAppliedOnlyUpcoming] = useState(false);
  const [appliedSelectedDays, setAppliedSelectedDays] = useState<string[]>([]);
  const [appliedSelectedSort, setAppliedSelectedSort] = useState<string>('POPULAR');

  const [challenges, setChallenges] = useState<ChallengeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 바텀시트 내부 임시 필터 상태 (적용하기 전까지는 API 호출 X)
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [tempOnlyUpcoming, setTempOnlyUpcoming] = useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>([]);
  const [tempSelectedSort, setTempSelectedSort] = useState<string>('POPULAR');

  // 바텀시트가 열릴 때 현재 적용된 필터를 임시 상태로 복사
  useEffect(() => {
    if (showFilterSheet) {
      setTempOnlyUpcoming(appliedOnlyUpcoming);
      setTempSelectedDays([...appliedSelectedDays]);
      setTempSelectedSort(appliedSelectedSort);
    }
  }, [showFilterSheet]);

  // 카테고리 변경 시 챌린지 목록 다시 로드 (API 재호출)
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiCategory = mapCategoryToApi(activeTab);
        const params: any = {
          page: 1,
          size: 20,
        };

        // category가 "ALL"이 아닐 때만 파라미터에 추가
        if (apiCategory !== 'ALL') {
          params.category = apiCategory;
        }

        // 적용된 필터만 API에 전달
        if (appliedOnlyUpcoming) {
          params.isUpcoming = true;
        }
        if (appliedSelectedDays.length > 0) {
          // day는 배열로 전달
          params.day = appliedSelectedDays;
        }
        if (appliedSelectedSort && appliedSelectedSort !== 'POPULAR') {
          // sortType: LATEST, OLDEST, POPULAR (기본값은 POPULAR이므로 POPULAR일 때는 보내지 않음)
          params.sortType = appliedSelectedSort;
        }

        const result = await getChallenges(params);
        setChallenges(result.content);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || '챌린지 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
        setChallenges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [activeTab, appliedOnlyUpcoming, appliedSelectedDays, appliedSelectedSort]);

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

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="챌린지"
        showDivider={false}
        useSafeArea={true}
        rightContent={
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Search');
            }}
            style={styles.searchButton}
          >
            <SearchTextPrimary width={20} height={20} />
          </TouchableOpacity>
        }
      />

      <View style={styles.tabBarContainer}>
        <TabBar
          tabs={categoryTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable={true}
          tabWidth={scale(80)}
          tabHeight={verticalScale(40)}
          tabGap={scale(4)}
          horizontalPadding={scale(20)}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAppliedOnlyUpcoming(!appliedOnlyUpcoming)}
        >
          {appliedOnlyUpcoming ? (
            <CheckboxFilterChecked width={24} height={24} />
          ) : (
            <CheckboxFilterUnchecked width={24} height={24} />
          )}
          <Text style={styles.checkboxLabel}>곧 시작하는 챌린지만</Text>
        </TouchableOpacity>

        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              appliedSelectedDays.length > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilterSheet(true)}
          >
            <Text style={[
              styles.filterButtonText,
              appliedSelectedDays.length > 0 && styles.filterButtonTextActive,
            ]}>
              {appliedSelectedDays.length > 0 ? `요일 ${appliedSelectedDays.length}` : '요일'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              appliedSelectedSort && appliedSelectedSort !== 'POPULAR' && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilterSheet(true)}
          >
            <Text style={[
              styles.filterButtonText,
              appliedSelectedSort && appliedSelectedSort !== 'POPULAR' && styles.filterButtonTextActive,
            ]}>
              {appliedSelectedSort === 'LATEST' ? '최신순' : appliedSelectedSort === 'OLDEST' ? '오래된순' : '인기순'}
            </Text>
            {appliedSelectedSort && appliedSelectedSort !== 'POPULAR' ? (
              <ChevronDownWhite width={8} height={12} style={styles.filterButtonIcon} />
            ) : (
              <ChevronDownTextPrimary width={8} height={12} style={styles.filterButtonIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>로딩 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LogoGray width={124.16} height={119.79} />
            <Text style={styles.emptyText}>
              선택한 필터에 맞는 챌린지가 없어요{'\n'}원하는 챌린지를 개설해 보세요!
            </Text>
          </View>
        ) : (
          challenges.map((challenge, index) => {
            const daysText = parseDaysOfWeek(challenge.daysOfWeek);
            const isLast = index === challenges.length - 1;

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
                marginBottom={isLast ? 0 : verticalScale(8)}
                marginHorizontal={scale(20)}
              />
            );
          })
        )}
      </ScrollView>

      {/* 필터 바텀시트 */}
      <BottomSheet visible={showFilterSheet} onClose={() => setShowFilterSheet(false)}>
        <View style={styles.bottomSheetContent}>
          {/* 정렬 섹션 */}
          <View style={styles.filterSection}>
            <CustomText variant="xsReg" color={colors.text.tertiary} style={styles.sectionTitle}>
              정렬
            </CustomText>
            <SortSelector
              selectedSort={tempSelectedSort}
              onSortChange={setTempSelectedSort}
            />
          </View>

          {/* 요일 섹션 */}
          <View style={styles.filterSection}>
            <CustomText variant="xsReg" color={colors.text.tertiary} style={styles.sectionTitle}>
              요일
            </CustomText>
            <View style={styles.daySelectorContainer}>
              <DaySelector
                selectedDays={tempSelectedDays}
                onDaysChange={setTempSelectedDays}
              />
            </View>
          </View>

          {/* 시작 섹션 */}
          <View style={styles.filterSection}>
            <CustomText variant="xsReg" color={colors.text.tertiary} style={styles.sectionTitle}>
              시작
            </CustomText>
            <TouchableOpacity
              style={[
                styles.checkboxRowBottomSheet,
                tempOnlyUpcoming && styles.checkboxRowBottomSheetSelected,
              ]}
              onPress={() => setTempOnlyUpcoming(!tempOnlyUpcoming)}
            >
              <CustomText variant="smReg" color={colors.text.tertiary} style={styles.checkboxTextBottomSheet}>
                곧 시작하는 챌린지만 모아볼까요?
              </CustomText>
              {tempOnlyUpcoming ? (
                <CheckboxChecked width={12} height={10} />
              ) : (
                <CheckboxUnchecked width={12} height={10} />
              )}
            </TouchableOpacity>
          </View>

          {/* 적용하기 버튼 */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              // 임시 상태를 적용된 상태로 업데이트 (이때 API 호출됨)
              setAppliedOnlyUpcoming(tempOnlyUpcoming);
              setAppliedSelectedDays([...tempSelectedDays]);
              setAppliedSelectedSort(tempSelectedSort || 'POPULAR');
              setShowFilterSheet(false);
            }}
          >
            <Text style={styles.applyButtonText}>적용하기</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* 우측 하단 플로팅 버튼 */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => {
          navigation.navigate('CreateChallengeQ1');
        }}
        activeOpacity={0.7}
      >
        <AddFab width={56} height={56} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tabBarContainer: {
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.background,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    ...typography.xsReg,
    color: colors.text.primary,
    marginLeft: scale(10),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    borderWidth: scale(1),
    borderColor: colors.line,
  },
  filterButtonActive: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  filterButtonText: {
    ...typography.xsReg,
    color: colors.text.primary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterButtonIcon: {
    marginLeft: scale(5),
  },
  searchButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(150),
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    lineHeight: verticalScale(21),
    marginTop: verticalScale(32),
  },
  errorText: {
    ...typography.smReg,
    color: colors.primary.main,
  },
  bottomSheetContent: {
    gap: verticalScale(32),
  },
  filterSection: {
    gap: verticalScale(16),
  },
  sectionTitle: {
    marginBottom: 0,
  },
  daySelectorContainer: {
    marginTop: verticalScale(4),
  },
  checkboxRowBottomSheet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(48),
    paddingHorizontal: scale(20),
    borderRadius: scale(12),
    borderWidth: scale(1.5),
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  checkboxRowBottomSheetSelected: {
    borderColor: colors.primary.sub,
  },
  checkboxTextBottomSheet: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: verticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  applyButtonText: {
    ...typography.md,
    color: colors.white,
  },
  fabButton: {
    position: 'absolute',
    right: scale(20),
    bottom: verticalScale(82),
    width: scale(56),
    height: verticalScale(56),
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: verticalScale(3),
    },
    shadowOpacity: 0.2,
    shadowRadius: scale(6),
    elevation: 6, // Android
  },
});

export default ChallengeListScreen;
