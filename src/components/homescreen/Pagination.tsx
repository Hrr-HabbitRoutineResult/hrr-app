import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../design/tokens"; // 너의 tokens.ts 사용

export type PaginationProps = {
  total: number;
  current: number;        // 0부터 시작
  gap?: number;           // 아이템 간 간격
  height?: number;        // 활성 바 높이
  dotSize?: number;       // 비활성 점 지름
  activeWidth?: number;   // 활성 바 길이
  activeColor?: string;   // 기본 colors.primary.main
  inactiveColor?: string; // 기본 colors.button
  style?: ViewStyle;
};

/** 점 + 알약형 활성 바 페이지네이션 */
export const Pagination: React.FC<PaginationProps> = memo(
  ({
    total,
    current,
    gap = 4,
    height = 6,
    dotSize = 6,
    activeWidth = 28,
    activeColor = colors.primary.main, // 토큰 반영
    inactiveColor = colors.button,     // 토큰 반영
    style,
  }) => {
    const clamped = Math.max(0, Math.min(current, Math.max(0, total - 1)));
    if (!Number.isFinite(total) || total <= 0) return null;

    return (
      <View
        style={[styles.container, { columnGap: gap, height }, style]}
        accessibilityRole="adjustable"
        accessibilityLabel={`페이지네이션, 총 ${total}개 중 ${clamped + 1}번째`}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === clamped;
          return (
            <View
              key={i}
              style={[
                isActive
                  ? [
                      styles.active,
                      {
                        width: activeWidth,
                        height,
                        backgroundColor: activeColor,
                        borderRadius: height / 2,
                      },
                    ]
                  : [
                      styles.dot,
                      {
                        width: dotSize,
                        height: dotSize,
                        backgroundColor: inactiveColor,
                        borderRadius: dotSize / 2,
                      },
                    ],
              ]}
              accessibilityState={{ selected: isActive }}
              accessible
            />
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: { opacity: 1 },
  active: { opacity: 1 },
});

export default Pagination;
