import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../design/tokens';
import { Text } from '../common/Text';

interface NotificationItemProps {
  profileImage: ImageSourcePropType;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  profileImage,
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
      <Image source={profileImage} style={styles.profileImage} />
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
    marginTop: verticalScale(4),
  },
});
