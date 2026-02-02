import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../design/tokens';

interface CarouselPaginationProps {
  scrollX: Animated.Value;
  totalItems: number;
  snapInterval: number;
}

export const CarouselPagination: React.FC<CarouselPaginationProps> = ({
  scrollX,
  totalItems,
  snapInterval,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalItems }, (_, index) => {
        const isEnd = index === 0 || index === totalItems - 1;

        // progress 계산
        const inputRange = [
          (index - 1) * snapInterval,
          index * snapInterval,
          (index + 1) * snapInterval,
        ];

        const activeProgress = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        // 크기 정의
        const inactiveWidth = isEnd ? scale(4) : scale(6);
        const inactiveHeight = isEnd ? verticalScale(4) : verticalScale(6);
        const activeWidth = scale(32);
        const activeHeight = verticalScale(6);

        // 크기 보간
        const width = activeProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [inactiveWidth, activeWidth],
        });

        const height = activeProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [inactiveHeight, activeHeight],
        });

        // 색상 보간
        const backgroundColor = activeProgress.interpolate({
          inputRange: [0, 0.5, 0.5, 1],
          outputRange: [colors.button, colors.button, colors.primary.main, colors.primary.main],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width,
                height,
                backgroundColor,
              },
              index < totalItems - 1 && styles.paginationDotSpacing,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    borderRadius: scale(3),
  },
  paginationDotSpacing: {
    marginRight: scale(4),
  },
});

