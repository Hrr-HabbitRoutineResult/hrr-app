import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity, Alert } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useChallengeStore } from '../store/challengeSlice';
import { useUserStore } from '../store/userSlice';
import { colors, typography, spacing } from '../design/tokens';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getDailyMissionCompleted, Challenge } from '../libs/api/challenge';

import TopAppBar from '../components/home/TopAppBar';
import { ChallengeSuggestButton } from '../components/home/ChallengeSuggestButton';
import ChallengeCarousel from '../components/home/ChallengeCarousel';
import CategoryChips from '../components/home/CategoryChips';
import PopularList from '../components/home/PopularList';
import RandomMissionBanner from '../components/home/RandomMissionBanner';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

const HomeScreen = () => {
  const { dailyTop, isLoading, error, fetchDailyTop } = useChallengeStore();
  const {
    userInfo,
    fetchUserInfo,
    setRandomMissionCompleted,
    myOngoingChallenges,
    fetchMyOngoingChallenges,
  } = useUserStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const ongoingChallenges: Challenge[] = useMemo(() => {
    return myOngoingChallenges.map((item) => ({
      id: item.challengeId,
      thumbnail: item.image,
      title: item.title,
      verified: item.verified,
    }));
  }, [myOngoingChallenges]);

  const fetchData = useCallback(async () => {
    try {
      // 모든 데이터 페칭 프로미스를 배열로 만듭니다.
      const promises = [
        fetchDailyTop(),
        fetchMyOngoingChallenges(),
        fetchUserInfo(),
        getDailyMissionCompleted().then(setRandomMissionCompleted)
      ];
      // 모든 프로미스가 완료될 때까지 기다립니다.
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to fetch data on refresh:", error);
      // 개별 에러 처리는 각 스토어/함수에서 처리하므로 여기서는 로깅만 합니다.
    }
  }, [fetchDailyTop, fetchMyOngoingChallenges, fetchUserInfo, setRandomMissionCompleted]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const nickname = useMemo(() => userInfo?.nickname || '...', [userInfo]);

  return (
    <View style={styles.safeArea}>
      <TopAppBar />
      <RefreshableScrollView
        style={styles.container}
        onRefresh={fetchData} // Pass the data fetching function as onRefresh
      >
        {/* 초기 로딩 시에만 로딩 인디케이터를 표시합니다. */}
        {isLoading && dailyTop.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText} allowFontScaling={false}>로딩 중...</Text>
          </View>
        ) : (
          <>
            <View style={styles.topSectionContainer}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeSubtitle} allowFontScaling={false}>안녕하세요 {nickname} 님!</Text>
                <Text style={styles.welcomeTitle} allowFontScaling={false}>오늘도 챌린지를 해볼까요?</Text>
              </View>

              <ChallengeCarousel challenges={ongoingChallenges} />

              <View style={styles.suggestButtonContainer}>
                <ChallengeSuggestButton
                  onPress={() => {
                    navigation.navigate('Onboarding');
                  }}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.listContainer}>
              <View style={styles.sectionContainer}>
                <CategoryChips />
              </View>

              <View style={styles.sectionContainer}>
                <PopularList challenges={dailyTop} />
              </View>

              <View style={[styles.sectionContainer, styles.lastSection]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle} allowFontScaling={false}>오늘의 랜덤미션</Text>
                </View>
                <RandomMissionBanner />
              </View>
            </View>
          </>
        )}
      </RefreshableScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.md,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.md,
    marginBottom: spacing.sm,
  },
  topSectionContainer: {
    backgroundColor: colors.white,
  },
  welcomeContainer: {
    paddingLeft: scale(20),
    paddingTop: verticalScale(16),
  },
  welcomeSubtitle: {
    ...typography.smMd,
    color: colors.text.secondary,
  },
  welcomeTitle: {
    marginTop: verticalScale(3),
    ...typography.header2,
    color: colors.text.primary,
  },
  suggestButtonContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(20),
  },
  divider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
  },
  listContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(130),
  },
  sectionContainer: {
    marginBottom: verticalScale(36),
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    ...typography.header4,
    color: colors.text.primary,
  },
});

export default HomeScreen;
