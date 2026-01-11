import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity, Alert } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useChallengeStore } from '../store/challengeSlice';
import { useUserStore } from '../store/userSlice';
import { colors, typography, spacing } from '../design/tokens';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Challenge, getDailyMissionCompleted } from '../libs/api/challenge';
import { handleLogout } from '../libs/auth/logout';

import TopAppBar from '../components/home/TopAppBar';
import { ChallengeSuggestButton } from '../components/home/ChallengeSuggestButton';
import ChallengeCarousel from '../components/home/ChallengeCarousel';
import CategoryChips from '../components/home/CategoryChips';
import PopularList from '../components/home/PopularList';
import RandomMissionBanner from '../components/home/RandomMissionBanner';

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
      todayEligible: item.currentRound > 0,
    }));
  }, [myOngoingChallenges]);

  useFocusEffect(
    useCallback(() => {
      fetchDailyTop();
      fetchMyOngoingChallenges();
      fetchUserInfo();

      const fetchDailyMissionCompleted = async () => {
        try {
          const isCompleted = await getDailyMissionCompleted();
          setRandomMissionCompleted(isCompleted);
        } catch (error) {
          // 에러가 나도 화면은 정상 동작하도록 함
        }
      };

      fetchDailyMissionCompleted();
    }, [fetchDailyTop, fetchMyOngoingChallenges, fetchUserInfo, setRandomMissionCompleted])
  );

  const nickname = useMemo(() => userInfo?.nickname || '...', [userInfo]);

  return (
    <View style={styles.safeArea}>
      <TopAppBar />
      <ScrollView style={styles.container}>
        {/* 로딩 상태 */}
        {isLoading && (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        )}

        {/* 에러 상태 - 전체 화면을 가리지 않고 로그만 출력하거나 조용히 넘어감 */}
        {/* {error && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="재시도"
            onPress={() => {
              fetchDailyTop();
            }}
          />
        </View>
      )} */}

        {/* 정상 데이터 렌더링 (로딩 중이 아닐 때만 표시하거나, 로딩 중에도 스켈레톤 등을 표시) */}
        {!isLoading && (
          <>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeSubtitle}>안녕하세요 {nickname} 님!</Text>
              <Text style={styles.welcomeTitle}>오늘도 챌린지를 해볼까요?</Text>
              {/* <Button title="로그아웃 테스트" onPress={handleLogoutTest} /> */}
            </View>

            <ChallengeCarousel challenges={ongoingChallenges} />

            <View style={styles.suggestButtonContainer}>
              <ChallengeSuggestButton
                onPress={() => {
                  navigation.navigate('Onboarding');
                }}
              />
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
                  <Text style={styles.sectionTitle}>오늘의 랜덤미션</Text>
                </View>
                <RandomMissionBanner />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    backgroundColor: colors.white,
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
    lineHeight: verticalScale(20),
  },
});

export default HomeScreen;
