import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { colors } from '../../design/tokens';

interface CarouselPaginationProps {
  currentIndex: number;
  totalItems: number;
}

export const CarouselPagination: React.FC<CarouselPaginationProps> = ({
  currentIndex,
  totalItems,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalItems }, (_, index) => {
        const isActive = index === currentIndex;
        const isEnd = index === 0 || index === totalItems - 1;

        // 현재 인덱스에 따라 스타일 결정
        let dotStyle;
        if (isActive) {
          // 현재 선택된 바
          dotStyle = styles.paginationDotActive;
        } else if (isEnd) {
          // 맨 끝 작은 원
          dotStyle = styles.paginationDotEnd;
        } else {
          // 양옆 원
          dotStyle = styles.paginationDot;
        }

        return (
          <View
            key={index}
            style={[
              dotStyle,
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
    width: scale(6),
    height: verticalScale(6),
    borderRadius: scale(3),
    backgroundColor: colors.button,
  },
  paginationDotActive: {
    width: scale(32),
    height: verticalScale(6),
    borderRadius: scale(3),
    backgroundColor: colors.primary.main,
  },
  paginationDotEnd: {
    width: scale(4),
    height: verticalScale(4),
    borderRadius: scale(2),
    backgroundColor: colors.button,
  },
  paginationDotSpacing: {
    marginRight: scale(4),
  },
});

