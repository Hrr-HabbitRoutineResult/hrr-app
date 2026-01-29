import React, { useState, useRef } from 'react';
import { View, StyleSheet, Modal, Pressable, TouchableOpacity, findNodeHandle } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';
import { Button } from '../common/Button';
import CommentIcon from '../../../assets/icons/comment-color.svg';
import { Text } from '../common/Text';
import { ProfileHeader } from './ProfileHeader';
import { BadgeRow } from './BadgeRow';
import { Level, levelToDisplayString } from '../../libs/api/user/types';
import { scale, verticalScale } from '../../utils/scaling';

interface UserProfile {
  nickname: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  level?: Level;
}

interface ProfileCardProps {
  user: UserProfile;
  variant?: 'me' | 'other';
  isFollowing?: boolean;
  isBlocked?: boolean;
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
  onPressProfileEdit?: () => void;
  onPressFollow?: () => void;
  onPressBlock?: () => void;
}

const ProfileCard = ({
  user,
  variant = 'me',
  isFollowing = false,
  isBlocked = false,
  onPressFollowers,
  onPressFollowing,
  onPressProfileEdit,
  onPressFollow,
  onPressBlock,
}: ProfileCardProps) => {
  const { nickname, avatarUrl, followerCount, followingCount, level = Level.CHALLENGER } = user;
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  const isOther = variant === 'other';

  const handleFollowingPress = () => {
    if (buttonRef.current) {
      const nodeHandle = findNodeHandle(buttonRef.current);
      if (nodeHandle) {
        (buttonRef.current as any).measure((_fx: number, _fy: number, width: number, height: number, px: number, py: number) => {
          setButtonLayout({ x: px, y: py, width, height });
          setPopoverVisible(true);
        });
      }
    }
  };

  const handleUnfollowConfirm = () => {
    if (onPressFollow) {
      onPressFollow();
    }
    setPopoverVisible(false);
  };

  const renderButtons = () => {
    if (!isOther) {
      return (
        <View style={styles.buttonRow}>
          <Button variant="gray" size="small" style={styles.singleButton} onPress={onPressProfileEdit || (() => { })}>
            <Text variant="xsMd" color={colors.text.tertiary}>
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
            onPress={onPressBlock || (() => { })}
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
          <TouchableOpacity
            ref={buttonRef}
            activeOpacity={0.9}
            style={[styles.followingButton, styles.singleButton]}
            onPress={handleFollowingPress}
          >
            <Text variant="smMd" color={colors.primary.main}>
              팔로잉
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonRow}>
        <Button variant="primary" size="small" style={styles.singleButton} onPress={onPressFollow || (() => { })}>
          <Text variant="smMd" color={colors.white}>
            팔로우
          </Text>
        </Button>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <ProfileHeader
          nickname={nickname}
          avatarUrl={avatarUrl}
          followerCount={followerCount}
          followingCount={followingCount}
          profileTypeText={levelToDisplayString[level]}
          onPressFollowers={onPressFollowers}
          onPressFollowing={onPressFollowing}
        />

        {renderButtons()}
      </View>

      <Modal visible={popoverVisible} transparent onRequestClose={() => setPopoverVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPopoverVisible(false)}>
          <View
            style={[
              styles.popover,
              {
                top: buttonLayout.y + buttonLayout.height - spacing.sm,
                left: buttonLayout.x + (buttonLayout.width * 0.6),
                width: buttonLayout.width * 0.4,
              },
            ]}
          >
            <TouchableOpacity onPress={handleUnfollowConfirm} style={styles.popoverButton}>
              <Text variant="smMd" color={colors.text.primary}>
                언팔로우하기
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(16),
    backgroundColor: colors.white,
  },
  buttonRow: {
    marginTop: verticalScale(12),
    flexDirection: 'row',
    gap: spacing.sm,
  },
  singleButton: {
    flex: 1,
    width: '100%',
    height: verticalScale(36),
    borderRadius: scale(10),
    backgroundColor: colors.background,
  },
  followingButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
  },
  popover: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: radius.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.84),
    elevation: 5,
  },
  popoverButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
});