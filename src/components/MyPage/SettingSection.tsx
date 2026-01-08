import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../design/tokens';
import { Text } from '../common/Text';

type SettingSectionProps = {
  title?: string;
  children: React.ReactNode;
};

const SettingSection = ({ title, children }: SettingSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {title && (
          <Text
            variant="xsMd"
            color={colors.text.tertiary}
            style={styles.title}
          >
            {title}
          </Text>
        )}

        <View style={styles.card}>{children}</View>
      </View>
    </View>
  );
};

export default SettingSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },

  contentWrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: colors.line,
  },

  title: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md, // Add padding to separate title from top border
    paddingBottom: spacing.xs, // Add padding to separate title from card content
  },

  card: {
    // backgroundColor: colors.white, // Moved to contentWrapper
    // borderTopWidth: 1, // Moved to contentWrapper
    // borderBottomWidth: 1, // Moved to contentWrapper
    // borderColor: colors.line, // Moved to contentWrapper
  },
});
