// src/components/profile/ProfileCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';
import { Button } from '../common/Button';
import CommentIcon from '../../../assets/icons/comment-color.svg';
import { Text } from '../common/Text';
import { ProfileHeader } from './ProfileHeader';
import { BadgeRow } from './BadgeRow';

interface UserProfile {
  nickname: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  isChallenger?: boolean;
}

interface ProfileCardProps {
  user: UserProfile;
  variant?: 'me' | 'other';

  isFollowing?: boolean;
  isBlocked?: boolean;

  badges?: React.ReactNode[]; // 추가: 뱃지 목록
}

const ProfileCard = ({
  user,
  variant = 'me',
  isFollowing = false,
  isBlocked = false,
  badges = [],
}: ProfileCardProps) => {
  const { nickname, avatarUrl, followerCount, followingCount, isChallenger } = user;

  const isOther = variant === 'other';

  const renderButtons = () => {
    if (!isOther) {
      return (
        <View style={styles.buttonRow}>
          <Button variant="gray" size="small" style={styles.singleButton} onPress={() => {}}>
            <Text variant="sm" color={colors.text.tertiary}>
              프로필 수정
            </Text>
          </Button>
        </View>
      );
    }

    if (isBlocked) {
      return (
        <View style={styles.buttonRow}>
          <Button
            variant="outlinePrimary"
            size="small"
            style={styles.singleButton}
            onPress={() => {}}
          >
            <Text variant="smMd" color={colors.primary.main}>
              차단됨
            </Text>
          </Button>
        </View>
      );
    }

    if (isFollowing) {
      return (
        <View style={styles.buttonRow}>
          <Button
            variant="outlinePrimary"
            size="small"
            style={[styles.buttonStyle, styles.iconOnlyButton]}
            onPress={() => {}}
          >
            <CommentIcon width={20} height={20} />
          </Button>

          <Button
            variant="outlinePrimary"
            size="small"
            style={styles.buttonStyle}
            onPress={() => {}}
          >
            <Text variant="smMd" color={colors.primary.main}>
              팔로잉
            </Text>
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.buttonRow}>
        <Button variant="primary" size="small" style={styles.singleButton} onPress={() => {}}>
          <Text variant="smMd" color={colors.white}>
            팔로우
          </Text>
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ProfileHeader
        nickname={nickname}
        avatarUrl={avatarUrl}
        followerCount={followerCount}
        followingCount={followingCount}
        profileTypeText={isChallenger ? '챌린저' : '챌린저'}
      />

      <BadgeRow badges={badges} />

      {renderButtons()}
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    width: 380,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: spacing.sm,
  },

  buttonStyle: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
  },

  singleButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
  },

  iconOnlyButton: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
