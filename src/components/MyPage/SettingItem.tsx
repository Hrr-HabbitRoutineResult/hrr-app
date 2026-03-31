import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';
import ChevronRightIcon from '../../../assets/icons/settingpage/chevron-right-B1B2B3.svg';

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
        <Text variant="md" color={colors.text.primary}>
          {label}
        </Text>
      </View>

      <View style={styles.chevronWrap}>
        <ChevronRightIcon width={10} height={17} />
      </View>
    </TouchableOpacity>
  );
};

export default SettingItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chevronWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
