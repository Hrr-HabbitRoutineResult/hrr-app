import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useChallengeStore } from '../store/challengeSlice';
import { useUserStore, selectNickname } from '../store/userSlice';
import { tokens } from '../design/tokens';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

import TopAppBar from '../components/home/TopAppBar';
import ChallengeCarousel from '../components/home/ChallengeCarousel';
import CategoryChips from '../components/home/CategoryChips';
import PopularList from '../components/home/PopularList';
import RandomMissionBanner from '../components/home/RandomMissionBanner';

const HomeScreen = () => {
  const { participating, popular, isLoading, error, fetchParticipating, fetchPopular } = useChallengeStore();
  const nickname = useUserStore(selectNickname);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchParticipating();
    fetchPopular();
  }, [fetchParticipating, fetchPopular]);

  if (isLoading) {
    return <View style={styles.container}><Text>로딩 중...</Text></View>; // 스켈레톤 UI로 교체 가능
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
        <Button title="재시도" onPress={() => { fetchParticipating(); fetchPopular(); }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TopAppBar />
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeSubtitle}>안녕하세요 {nickname}님</Text>
        <Text style={styles.welcomeTitle}>오늘도 챌린지를 해볼까요?</Text>
      </View>
      <ChallengeCarousel challenges={participating} />
      <TouchableOpacity style={styles.recommendButton} onPress={() => navigation.navigate('ChallengeList', { recommend: true })}>
        <Text style={styles.recommendButtonText}>나에게 맞는 챌린지 추천받기</Text>
      </TouchableOpacity>
      <CategoryChips />
      <PopularList challenges={popular} />
      <RandomMissionBanner />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.white,
  },
  welcomeContainer: {
    padding: tokens.spacing.md,
  },
  welcomeSubtitle: {
    ...tokens.typography.smReg,
    color: tokens.color.text.secondary,
  },
  welcomeTitle: {
    ...tokens.typography.header2,
    color: tokens.color.text.primary,
  },
  recommendButton: {
    backgroundColor: tokens.color.primary.main,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    margin: tokens.spacing.md,
    alignItems: 'center',
  },
  recommendButtonText: {
    ...tokens.typography.md,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
