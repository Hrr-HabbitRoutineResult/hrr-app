import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
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
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
    marginHorizontal: spacing.xxs,
  },
});

export default Pagination;