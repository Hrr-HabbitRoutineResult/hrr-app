import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing, radius } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { formatParticipants } from '../../libs/format';
import ChevronRightPrimary from '../../../assets/icons/chevron-right-primary.svg';
import PersonIcon from '../../../assets/icons/person.svg';

type Challenge = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  cadence: string;
  dDay: number;
  participants: number;
  maxParticipants: number;
};

const PopularList = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 더미데이터
    setTimeout(() => {
      setChallenges([
        {
          id: '1',
          title: '백준 실버3 코테',
          description: '백준 실버3 매일 풀고 공유',
          thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
          cadence: '매일',
          dDay: 1,
          participants: 10,
          maxParticipants: 30,
        },
        {
          id: '2',
          title: '백준 실버3 코테',
          description: '백준 실버3 매일 풀고 공유',
          thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
          cadence: '매일',
          dDay: 1,
          participants: 10,
          maxParticipants: 30,
        },
        {
          id: '3',
          title: '백준 실버3 코테',
          description: '백준 실버3 매일 풀고 공유',
          thumbnail: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
          cadence: '매일',
          dDay: 1,
          participants: 10,
          maxParticipants: 30,
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const handleSeeMore = () => {
    navigation.navigate('ChallengeList', { category: 'popular' });
  };

  if (loading) {
    return (
      <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSeeMore} style={styles.header}>
        <Text style={styles.headerTitle}>오늘의 인기 챌린지</Text>
        <View style={styles.iconContainer}>
          <ChevronRightPrimary width={5} height={10} />
        </View>
      </TouchableOpacity>

      {challenges.slice(0, 3).map((challenge) => (
        <TouchableOpacity key={challenge.id} style={styles.card}>
          <Image source={{ uri: challenge.thumbnail }} style={styles.thumbnail} />

          {/* D-Day 오버레이 */}
          <View style={styles.dDayOverlay}>
            <Text style={styles.dDayText}>D-{challenge.dDay}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.subText}>{challenge.description}</Text>
          </View>

          {/* Right Container */}
          <View style={styles.rightContainer}>
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyText}>{challenge.cadence}</Text>
            </View>

            {/* 참가자 영역 */}
            <View style={styles.participantRow}>
              <PersonIcon width={14} height={14} />
              <Text style={styles.participantCount}>
                {challenge.participants}/{challenge.maxParticipants}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.header3,
    color: colors.text.primary,
    marginRight: spacing.xxs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  dDayOverlay: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dDayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...typography.md,
    color: colors.text.primary,
  },
  subText: {
    ...typography.xsReg,
    color: colors.text.secondary,
  },


  rightContainer: {
    width: 43,
    height: 38,
    alignItems: 'flex-end',
  },

  dailyBadge: {
    width: 37,
    height: 18,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  dailyText: {
      color: colors.primary.main,
      fontSize: 12,
      lineHeight: 14, // 중앙 정렬 위해 badge height와 동일
      textAlign: 'center',
    },

  participantRow: {
    width: 43,
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  participantCount: {
      color: colors.text.primary,
      fontFamily: 'Pretendard',
      fontWeight: '400',
      fontSize: 10,
      letterSpacing: -0.3,
      textAlign: 'right',
      marginLeft: 2,
      height: 14,
    },

});

export default PopularList;
