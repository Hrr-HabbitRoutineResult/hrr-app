import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';
import ChevronRightIcon from '../../../assets/icons/chevron-right-ic-grey.svg';

type SettingItemProps = {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
};

const SettingItem = ({ icon, label, onPress }: SettingItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.left}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text variant="smMd" color={colors.text.primary}>
          {label}
        </Text>
      </View>

      <ChevronRightIcon width={14} height={14} />
    </TouchableOpacity>
  );
};

export default SettingItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
