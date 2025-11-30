import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useChallengeStore } from '../store/challengeSlice';
import { useUserStore, selectNickname } from '../store/userSlice';
import { colors, typography, spacing } from '../design/tokens';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

import TopAppBar from '../components/home/TopAppBar';
import ChallengeCarousel from '../components/home/ChallengeCarousel';
import { ChallengeSuggestButton } from '../components/home/ChallengeSuggestButton';
import CategoryChips from '../components/home/CategoryChips';
import PopularList from '../components/home/PopularList';
import RandomMissionBanner from '../components/home/RandomMissionBanner';
import SectionHeader from '../components/common/SectionHeader';

const HomeScreen = () => {
  const { participating, popular, isLoading, error, fetchParticipating, fetchPopular } =
    useChallengeStore();
  const nickname = useUserStore(selectNickname);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchParticipating();
    fetchPopular();
  }, [fetchParticipating, fetchPopular]);

  return (
    <ScrollView style={styles.container}>
      <TopAppBar />

      {/* 로딩 상태 */}
      {isLoading && (
        <View style={styles.centerBox}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* 에러 상태 */}
      {error && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="재시도"
            onPress={() => {
              fetchParticipating();
              fetchPopular();
            }}
          />
        </View>
      )}

      {/* 정상 데이터 렌더링 */}
      {!isLoading && !error && (
        <>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeSubtitle}>안녕하세요 {nickname} 님!</Text>
            <Text style={styles.welcomeTitle}>오늘도 챌린지를 해볼까요?</Text>
          </View>

          <ChallengeCarousel challenges={participating} />

          <ChallengeSuggestButton
            onPress={() =>
              navigation.navigate('ChallengeList', { recommend: true })
            }
          />

          <View style={styles.listContainer}>
            <CategoryChips />

            <PopularList challenges={popular} />

            <View>
              <SectionHeader title="오늘의 랜덤미션" />
              <RandomMissionBanner />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
//     color: colors.error.main,
    marginBottom: spacing.sm,
  },
  welcomeContainer: {
    padding: spacing.md,
  },
  welcomeSubtitle: {
    ...typography.smMd,
    color: colors.text.secondary,
  },
  welcomeTitle: {
    ...typography.header2,
    color: colors.text.primary,
  },
  listContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 40,
  },
});

export default HomeScreen;
