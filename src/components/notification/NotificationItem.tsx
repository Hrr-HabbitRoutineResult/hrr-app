import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../design/tokens';
import { Text } from '../common/Text';
import { ProfileImage } from '../common/ProfileImage';

interface NotificationItemProps {
  profileImageUrl?: string | null;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  profileImageUrl,
  title,
  description,
  timeAgo,
  isRead,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !isRead && styles.notificationItemUnread,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileImage}>
        <ProfileImage uri={profileImageUrl} size={scale(40)} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            variant="smMd"
            color={colors.text.primary}
            style={styles.notificationTitle}
          >
            {title}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {timeAgo}
          </Text>
        </View>
        <Text
          variant="xsReg"
          color={colors.text.primary}
          style={styles.notificationDescription}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
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
    marginTop: verticalScale(4),
  },
});
