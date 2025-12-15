import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../design/tokens';
import PersonIcon from '../../../assets/icons/person.svg';

interface ChallengeItemProps {
  challengeId: number;
  thumbnailUrl: string;
  title: string;
  description: string;
  daysText: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  onPress: () => void;
  ddayUntilStart?: number;
  rank?: number;
  marginBottom?: number;
  marginHorizontal?: number;
}

// 공통 ChallengeItem 컴포넌트 (챌린지 목록 아이템)
const ChallengeItem: React.FC<ChallengeItemProps> = ({
  challengeId,
  thumbnailUrl,
  title,
  description,
  daysText,
  currentParticipantCount,
  maxParticipantCount,
  onPress,
  ddayUntilStart,
  rank,
  marginBottom = 8,
  marginHorizontal,
}) => {
  // 시작일이 오늘인지 확인 (D-0인 경우 오버레이 표시 안 함)
  const isDdayZero = ddayUntilStart === 0;
  // 디데이 오버레이 표시 여부 -> ddayUntilStart가 있고 0이 아니며, 랭킹이 없는 경우
  const showDDayOverlay = ddayUntilStart !== undefined && !isDdayZero && rank === undefined;

  return (
    <TouchableOpacity
      key={challengeId}
      style={[
        styles.card,
        { marginBottom },
        marginHorizontal !== undefined && { marginHorizontal }
      ]}
      onPress={onPress}
    >
      {/* 썸네일 컨테이너 */}
      <View style={styles.thumbnailContainer}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {showDDayOverlay && (
            <View style={styles.dDayOverlay}>
              <Text style={styles.dDayText}>D-{ddayUntilStart}</Text>
            </View>
          )}
        </View>
        {/* 순위 표시 (랭킹이 있는 경우) */}
        {rank !== undefined && (
          <View style={[
            styles.rankCircle,
            rank > 3 && styles.rankCircleGray
          ]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </View>

      {/* 챌린지 정보 영역 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subText} numberOfLines={1} ellipsizeMode="tail">
          {description}
        </Text>
      </View>

      {/* 오른쪽 영역 (요일 배지, 참가자 수) */}
      <View style={styles.rightContainer}>
        <View style={styles.dailyBadge}>
          <Text style={styles.dailyText}>{daysText}</Text>
        </View>

        <View style={styles.participantRow}>
          <View style={styles.iconWrapper}>
            <PersonIcon width={14} height={14} />
          </View>
          <Text style={styles.participantCount}>
            {currentParticipantCount} / {maxParticipantCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    height: 80,
    padding: 16,
    position: 'relative',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    position: 'relative',  // 랭킹 circle absolute 위치 기준
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 5.54,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.button,
  },
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
  rankCircle: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary.main, // 1~3위
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankCircleGray: {
    backgroundColor: colors.icon.gray, // 4-10위
  },
  rankText: {
    ...typography.xsMd,
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
});

export default ChallengeItem;

