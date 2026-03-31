import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';

type SettingSectionProps = {
  title?: string;
  children: React.ReactNode;
  isLast?: boolean;
};

const SettingSection = ({ title, children, isLast }: SettingSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {title && (
          <Text
            variant="xsReg"
            color={colors.text.tertiary}
            style={styles.title}
          >
            {title}
          </Text>
        )}

        <View style={styles.card}>{children}</View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
};

export default SettingSection;

const styles = StyleSheet.create({
  container: {},

  contentWrapper: {
    backgroundColor: colors.white,
  },

  title: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  card: {},

  divider: {
    height: 8,
    backgroundColor: colors.background,
  },
});
