import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  findNodeHandle,
} from 'react-native';
import { colors, spacing } from '../../design/tokens';
import { Button } from '../common/Button';
import { Text } from '../common/Text';
import { ProfileHeader } from './ProfileHeader';
import { scale, verticalScale } from '../../utils/scaling';

interface UserProfile {
  nickname: string;
  avatarUrl?: string | null;
  followerCount: number;
  followingCount: number;
}

interface ProfileCardProps {
  user: UserProfile;
  variant?: 'me' | 'other';
  isFollowing?: boolean;
  isBlocked?: boolean;
  isFollowLoading?: boolean;
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
  isFollowLoading = false,
  onPressFollowers,
  onPressFollowing,
  onPressProfileEdit,
  onPressFollow,
  onPressBlock,
}: ProfileCardProps) => {
  const { nickname, avatarUrl, followerCount, followingCount } = user;
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const buttonRef = useRef<View>(null);

  const isOther = variant === 'other';

  const handleFollowingPress = () => {
    if (buttonRef.current) {
      const nodeHandle = findNodeHandle(buttonRef.current);
      if (nodeHandle) {
        (buttonRef.current as any).measure(
          (
            _fx: number,
            _fy: number,
            width: number,
            height: number,
            px: number,
            py: number,
          ) => {
            setButtonLayout({ x: px, y: py, width, height });
            setPopoverVisible(true);
          },
        );
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
          <Button
            variant="gray"
            size="small"
            style={styles.singleButton}
            onPress={onPressProfileEdit || (() => {})}
          >
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
            onPress={onPressBlock || (() => {})}
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
            style={[styles.singleButton, styles.followingButton]}
            onPress={handleFollowingPress}
            disabled={isFollowLoading}
          >
            {isFollowLoading ? (
              <ActivityIndicator size="small" color={colors.primary.main} />
            ) : (
              <Text variant="xsMd" color={colors.primary.main}>
                팔로잉
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonRow}>
        <Button
          variant="primary"
          size="small"
          style={styles.followButton}
          onPress={onPressFollow || (() => {})}
          disabled={isFollowLoading}
        >
          {isFollowLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text variant="xsMd" color={colors.white}>
              팔로우
            </Text>
          )}
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
          onPressFollowers={onPressFollowers}
          onPressFollowing={onPressFollowing}
        />

        {renderButtons()}
      </View>

      <Modal
        visible={popoverVisible}
        transparent
        onRequestClose={() => setPopoverVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPopoverVisible(false)}
        >
          <View
            style={[
              styles.popover,
              {
                top: buttonLayout.y + buttonLayout.height + verticalScale(8),
                right: scale(20),
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleUnfollowConfirm}
              style={styles.popoverButton}
            >
              <Text variant="smReg" color={colors.text.primary}>
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
  followButton: {
    flex: 1,
    width: '100%',
    height: verticalScale(36),
    borderRadius: scale(10),
  },
  followingButton: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
  },
  popover: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: scale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.08,
    shadowRadius: scale(40),
    elevation: 5,
  },
  popoverButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(41.5),
    alignItems: 'center',
  },
});
