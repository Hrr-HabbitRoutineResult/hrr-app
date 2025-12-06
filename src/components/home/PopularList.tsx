import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing, radius } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { DailyTopChallengeItem } from '../../libs/api/challenge';
import ChevronRightIcGrey from '../../../assets/icons/chevron-right-ic-grey.svg';
import PersonIcon from '../../../assets/icons/person.svg';
import EmptyPopularChallenge from '../../../assets/images/empty-popular-challenge.svg';

interface PopularListProps {
  challenges: DailyTopChallengeItem[];
}

const PopularList: React.FC<PopularListProps> = ({ challenges }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSeeMore = () => {
    navigation.navigate('ChallengeList', { category: 'popular' });
  };

  // 요일 파싱 함수
  const parseDaysOfWeek = (daysData: string | string[]) => {
    try {
      let days: string[] = [];
      
      if (Array.isArray(daysData)) {
        days = daysData;
      } else if (typeof daysData === 'string') {
        // 문자열인 경우 파싱 (작은 따옴표를 큰 따옴표로 변경)
        const validJson = daysData.replace(/'/g, '"');
        days = JSON.parse(validJson);
      }

      if (Array.isArray(days)) {
        if (days.length === 7) return '매일';
        
        const dayMap: Record<string, string> = {
          MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목',
          FRIDAY: '금', SATURDAY: '토', SUNDAY: '일'
        };
        
        // API에서 오는 요일 데이터를 한글로 변환
        return days.map(d => dayMap[d] || d).join(' / ');
      }
      return '매일';
    } catch (e) {
      return '매일';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSeeMore} style={styles.header}>
        <Text style={styles.headerTitle}>오늘의 인기 챌린지</Text>
        <View style={styles.iconContainer}>
          <ChevronRightIcGrey width={5} height={10} />
        </View>
      </TouchableOpacity>

      {challenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyPopularChallenge 
            width="100%" 
            height="100%" 
            preserveAspectRatio="none"
            style={styles.emptyBackground}
          />
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>아직 랭킹이 없어요</Text>
            <Text style={styles.emptySubtitle}>새로운 하루의 챌린지 순위를 집계 중이에요</Text>
          </View>
        </View>
      ) : (
        challenges.map((item, index) => {
          const { info } = item;
          const daysText = parseDaysOfWeek(info.daysOfWeek);
          const isDdayZero = info.ddayUntilStart === 0;
          const isLast = index === challenges.length - 1;

          return (
            <TouchableOpacity 
              key={info.challengeId} 
              style={[styles.card, isLast && { marginBottom: 0 }]}
              onPress={() => navigation.navigate('ChallengeProfile', { challengeId: info.challengeId })}
            >
              <View style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: info.thumbnailUrl }}
                  style={[styles.thumbnail, { backgroundColor: '#eee' }]}
                  resizeMode="cover"
                />
                {!isDdayZero && (
                  <View style={styles.dDayOverlay}>
                    <Text style={styles.dDayText}>D-{info.ddayUntilStart}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title}>{info.title}</Text>
                <Text style={styles.subText} numberOfLines={1} ellipsizeMode="tail">
                  {info.description}
                </Text>
              </View>

              <View style={styles.rightContainer}>
                <View style={styles.dailyBadge}>
                  <Text style={styles.dailyText}>{daysText}</Text>
                </View>

                <View style={styles.participantRow}>
                  <View style={styles.iconWrapper}>
                    <PersonIcon width={14} height={14} />
                  </View>
                  <Text style={styles.participantCount}>
                    {info.currentParticipantCount} / {info.maxParticipantCount}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },

  headerTitle: {
    ...typography.header4,
    color: colors.text.primary,
    marginRight: spacing.xxs,
    lineHeight: 20,
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
    borderRadius: 20,
    height: 80,
    padding: spacing.md,
    marginBottom: spacing.xs,
    position: 'relative',
  },

  /* 썸네일 + 오버레이 래퍼 */
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 5.54,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  /* 썸네일 전체 오버레이 */
  dDayOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dDayText: {
    ...typography.header3,
    color: colors.white,
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    ...typography.smMd,
    color: colors.text.primary,
    marginBottom: 5,
  },

  subText: {
    ...typography.xxs,
    color: colors.text.tertiary,
  },

  rightContainer: {
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },

  dailyBadge: {
    paddingHorizontal: 8,
    height: 18,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  dailyText: {
    ...typography.xxs,
    color: colors.primary.main,
    textAlign: 'center',
  },

  participantRow: {
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    paddingTop: 2,
  },

  participantCount: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: 4,
  },

  emptyContainer: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  emptyTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 21,
    paddingVertical: 22,
  },
  emptyTitle: {
    ...typography.smMd,
    color: colors.text.primary,
    marginBottom: 2,
  },
  emptySubtitle: {
    ...typography.xxs,
    color: colors.text.primary,
  },
});

export default PopularList;
