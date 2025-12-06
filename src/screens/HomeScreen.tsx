import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useChallengeStore } from '../store/challengeSlice';
import { colors, typography, spacing } from '../design/tokens';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getUserMe, getOngoingChallenges } from '../libs/api/user';
import { Challenge } from '../libs/api/challenge';

import TopAppBar from '../components/home/TopAppBar';
import { ChallengeSuggestButton } from '../components/home/ChallengeSuggestButton';
import ChallengeCarousel from '../components/home/ChallengeCarousel';
import CategoryChips from '../components/home/CategoryChips';
import PopularList from '../components/home/PopularList';
import RandomMissionBanner from '../components/home/RandomMissionBanner';

const HomeScreen = () => {
  const { dailyTop, isLoading, error, fetchDailyTop } = useChallengeStore();
  const [nickname, setNickname] = useState('');
  const [ongoingChallenges, setOngoingChallenges] = useState<Challenge[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchDailyTop();

    // 사용자 정보 조회
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserMe();
        setNickname(userInfo.nickname);
      } catch (error) {
        // 에러가 나도 화면은 정상 동작하도록 함
      }
    };

    // 참여 중인 챌린지 조회
    const fetchOngoingChallenges = async () => {
      try {
        const challenges = await getOngoingChallenges();

        // API 응답을 Challenge 타입으로 변환
        const transformedChallenges: Challenge[] = challenges.map((item) => ({
          id: item.challengeId,
          thumbnail: item.image,
          title: item.title,
          todayEligible: item.currentRound > 0, // currentRound가 0보다 크면 오늘 인증 가능
        }));

        setOngoingChallenges(transformedChallenges);
      } catch (error) {
        // 에러가 나도 화면은 정상 동작하도록 함
      }
    };

    fetchUserInfo();
    fetchOngoingChallenges();
  }, [fetchDailyTop]);

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
            </View>

            <ChallengeCarousel challenges={ongoingChallenges} />

            <View style={styles.suggestButtonContainer}>
              <ChallengeSuggestButton
                onPress={() =>
                  navigation.navigate('ChallengeList', { recommend: true })
                }
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
    paddingLeft: 20,
    paddingTop: 16,
  },
  welcomeSubtitle: {
    ...typography.smMd,
    color: colors.text.secondary,
  },
  welcomeTitle: {
    marginTop: 3,
    ...typography.header2,
    color: colors.text.primary,
  },
  suggestButtonContainer: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  listContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 130,
  },
  sectionContainer: {
    marginBottom: 36,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.header4,
    color: colors.text.primary,
    lineHeight: 20,
  },
});

export default HomeScreen;
