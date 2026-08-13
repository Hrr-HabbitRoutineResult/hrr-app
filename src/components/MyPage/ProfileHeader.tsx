import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../design/tokens';
import { Avatar } from './Avatar';
import { Text } from '../common/Text';
import { scale, verticalScale } from '../../utils/scaling';

interface ProfileHeaderProps {
  nickname: string;
  avatarUrl?: string | null;
  followerCount: number;
  followingCount: number;
  profileTypeText?: string;
  showProfileType?: boolean;
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
}

export const ProfileHeader = ({
  nickname,
  avatarUrl,
  followerCount,
  followingCount,
  profileTypeText = '챌린저',
  showProfileType = true,
  onPressFollowers,
  onPressFollowing,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.profileRow}>
      <Avatar uri={avatarUrl} size={scale(80)} />

      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text variant="header2" color={colors.text.primary} style={styles.nickname}>
            {nickname}
          </Text>
          {showProfileType && (
            <>
              <View style={styles.dot} />
              <Text variant="smReg" color={colors.text.tertiary} style={styles.profileType}>
                {profileTypeText}
              </Text>
            </>
          )}
        </View>

        <View style={styles.followRow}>
          <TouchableOpacity onPress={onPressFollowers} style={styles.followerContainer}>
            <Text variant="xsReg" color={colors.text.tertiary}>
              팔로워
            </Text>
            <Text
              variant="xsMd"
              color={colors.text.primary}
              style={styles.countText}
            >
              {followerCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressFollowing} style={styles.followingContainer}>
            <Text variant="xsReg" color={colors.text.tertiary}>
              팔로잉
            </Text>
            <Text
              variant="xsMd"
              color={colors.text.primary}
              style={styles.countText}
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
    gap: scale(20),
  },

  profileInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },

  nickname: {},

  profileType: {
    marginTop: verticalScale(1),
  },

  followRow: {
    marginTop: verticalScale(8),
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
    left: scale(28),
    borderRadius: radius.sm,
  },

  countText: {
    marginLeft: scale(4),
  },

  dot: {
    width: scale(2),
    height: scale(2),
    borderRadius: scale(1),
    backgroundColor: colors.text.primary,
    marginHorizontal: 5,
  },
});
