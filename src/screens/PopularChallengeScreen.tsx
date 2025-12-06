import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useChallengeStore } from '../store/challengeSlice';
import { colors, typography } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import ChallengeItem from '../components/common/ChallengeItem';

const PopularChallengeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { dailyTop10, isLoading10, fetchDailyTop } = useChallengeStore();

  useEffect(() => {
    fetchDailyTop(10);
  }, [fetchDailyTop]);

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
        title="오늘의 인기 챌린지"
        showDivider={true}
        useSafeArea={true}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* TOP 10 타이틀 섹션 */}
        <View style={styles.top10Container}>
          <Text style={styles.top10Title}>TOP 10</Text>
          <Text style={styles.top10Subtitle}>오늘의 인기 챌린지 순위예요!</Text>
        </View>

        {/* 1위부터 10위까지 리스트 */}
        {!isLoading10 && dailyTop10.map((item, index) => {
          const { info } = item;
          const daysText = parseDaysOfWeek(info.daysOfWeek);
          const rank = index + 1;
          const isLast = index === dailyTop10.length - 1;

          return (
            <ChallengeItem
              key={info.challengeId}
              challengeId={info.challengeId}
              thumbnailUrl={info.thumbnailUrl}
              title={info.title}
              description={info.description}
              daysText={daysText}
              currentParticipantCount={info.currentParticipantCount}
              maxParticipantCount={info.maxParticipantCount}
              ddayUntilStart={info.ddayUntilStart}
              rank={rank}
              onPress={() => navigation.navigate('ChallengeProfile', { challengeId: info.challengeId })}
              marginBottom={isLast ? 0 : 6}
              marginHorizontal={20}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  top10Container: {
    backgroundColor: colors.white,
    height: 92,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  top10Title: {
    ...typography.header1,
    color: colors.primary.sub,
    paddingBottom: 4,
  },
  top10Subtitle: {
    ...typography.md,
    color: colors.text.primary,
  },
});

export default PopularChallengeScreen;

