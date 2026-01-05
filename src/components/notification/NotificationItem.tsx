import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../design/tokens';
import { Text } from '../common/Text';

interface NotificationItemProps {
  type: 'normal' | 'challenge_ending';
  profileImage: number;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  onYesPress?: () => void;
  onNoPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  profileImage,
  title,
  description,
  timeAgo,
  type,
  isRead,
  onYesPress,
  onNoPress,
}) => {
  return (
    <View style={[
      styles.notificationItem,
      !isRead && styles.notificationItemUnread,
    ]}>
      <Image source={profileImage} style={styles.profileImage} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text variant="smMd" color={colors.text.primary} style={styles.notificationTitle}>
            {title}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {timeAgo}
          </Text>
        </View>
        <Text variant="xsReg" color={colors.text.primary} style={styles.notificationDescription}>
          {description}
        </Text>

        {type === 'challenge_ending' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.yesButton} onPress={onYesPress}>
              <Text variant="xsReg" color={colors.white} style={styles.yesButtonText}>
                네
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noButton} onPress={onNoPress}>
              <Text variant="xsReg" color={colors.text.primary} style={styles.noButtonText}>
                아니오
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: colors.white,
  },
  notificationItemUnread: {
    backgroundColor: colors.primary.lightest,
  },
  profileImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(14),
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    flex: 1,
    marginRight: scale(8),
  },
  notificationDescription: {
    lineHeight: verticalScale(18),
    marginTop: verticalScale(4),
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(16),
    gap: scale(8),
  },
  yesButton: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(52),
    minHeight: verticalScale(26),
  },
  yesButtonText: {
    lineHeight: verticalScale(18),
  },
  noButton: {
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    backgroundColor: colors.background,
    borderWidth: scale(1),
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(74),
    minHeight: verticalScale(26),
  },
  noButtonText: {
    lineHeight: verticalScale(18),
  },
});

