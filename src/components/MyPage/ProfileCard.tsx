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
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
}

const ProfileCard = ({
  user,
  variant = 'me',
  isFollowing = false,
  isBlocked = false,
  badges = [],
  onPressFollowers,
  onPressFollowing,
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
            <Text variant="sm" color={colors.primary.main}>
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
            <Text variant="sm" color={colors.primary.main}>
              팔로잉
            </Text>
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.buttonRow}>
        <Button variant="primary" size="small" style={styles.singleButton} onPress={() => {}}>
          <Text variant="sm" color={colors.white}>
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
        onPressFollowers={onPressFollowers}
        onPressFollowing={onPressFollowing}
      />

      {/* <BadgeRow badges={badges} /> */}

      {renderButtons()}
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
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
    width: '100%',
    height: 40,
    borderRadius: radius.md,
  },

  iconOnlyButton: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
