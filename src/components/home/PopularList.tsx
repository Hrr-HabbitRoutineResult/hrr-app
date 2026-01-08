import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { DailyTopChallengeItem, trackChallengeClick } from '../../libs/api/challenge';
import ChevronRightIcGrey from '../../../assets/icons/chevron-right-ic-grey.svg';
import EmptyPopularChallenge from '../../../assets/images/empty-popular-challenge.svg';
import ChallengeItem from '../common/ChallengeItem';

interface PopularListProps {
  challenges: DailyTopChallengeItem[];
}

const PopularList: React.FC<PopularListProps> = ({ challenges }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSeeMore = () => {
    navigation.navigate('PopularChallenge');
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
          const isLast = index === challenges.length - 1;

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
              onPress={() => {
                trackChallengeClick(info.challengeId);
                navigation.navigate('ChallengeProfile', { challengeId: info.challengeId });
              }}
              marginBottom={isLast ? 0 : 8}
            />
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
    paddingBottom: verticalScale(2),
  },

  headerTitle: {
    ...typography.header4,
    color: colors.text.primary,
    lineHeight: verticalScale(20),
  },

  iconContainer: {
    paddingTop: verticalScale(13),
    paddingBottom: verticalScale(13),
    paddingLeft: scale(15),
    paddingRight: scale(16),
  },
  emptyContainer: {
    width: '100%',
    height: verticalScale(80),
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
    paddingLeft: scale(21),
    paddingVertical: verticalScale(22),
  },
  emptyTitle: {
    ...typography.smMd,
    color: colors.text.primary,
    marginBottom: verticalScale(2),
  },
  emptySubtitle: {
    ...typography.xxs,
    color: colors.text.primary,
  },
});

export default PopularList;
