import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../design/tokens';

type PaginationProps = {
  total: number;
  current: number;
};

const Pagination = ({ total, current }: PaginationProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: (index + 1) === current ? colors.primary.main : colors.icon.gray },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xxs,
  },
});

export default Pagination;