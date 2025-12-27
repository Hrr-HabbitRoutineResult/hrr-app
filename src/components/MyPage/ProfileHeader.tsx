// src/components/profile/ProfileHeader.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';
import { Avatar } from './Avatar';
import { Text } from '../common/Text';
import ChevronRightIcon from '../../../assets/icons/chevron-right-grey.svg';

interface ProfileHeaderProps {
  nickname: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  profileTypeText?: string; // 기본: "챌린저"
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
}

export const ProfileHeader = ({
  nickname,
  avatarUrl,
  followerCount,
  followingCount,
  profileTypeText = '챌린저',
  onPressFollowers,
  onPressFollowing,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.profileRow}>
      <Avatar uri={avatarUrl} size={80} />

      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text variant="header4" color={colors.text.primary} style={styles.nickname}>
            {nickname}
          </Text>
          <View style={styles.dot} />
          <Text variant="xsReg" color={colors.text.secondary} style={styles.profileType}>
            {profileTypeText}
          </Text>

          <ChevronRightIcon width={4} height={8} />
        </View>

        <View style={styles.followRow}>
          <TouchableOpacity onPress={onPressFollowers} style={styles.followerContainer}>
            <Text variant="xsReg" color={colors.text.secondary}>
              팔로워
            </Text>
            <Text
              variant="xsReg"
              color={colors.text.primary}
              style={[styles.countText, styles.countBold]}
            >
              {followerCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressFollowing} style={styles.followingContainer}>
            <Text variant="xsReg" color={colors.text.secondary}>
              팔로잉
            </Text>
            <Text
              variant="xsReg"
              color={colors.text.primary}
              style={[styles.countText, styles.countBold]}
            >
              {followingCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  nickname: {},

  profileType: {
    marginTop: 1,
  },

  followRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },

  followerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
  },

  followingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    left: 30,
    borderRadius: radius.sm,
  },

  countText: {
    marginLeft: 4,
  },

  countBold: {
    fontWeight: '700',
  },

  dot: {
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.text.secondary,
      marginTop: 1, // 텍스트 베이스라인 미세 조정 필요하면 0~2 사이로
    },
});
