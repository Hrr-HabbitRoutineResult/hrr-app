import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../design/tokens";

export type PaginationProps = {
  total: number;
  current: number;        // 0부터 시작
  gap?: number;           // 아이템 간 간격
  height?: number;        // 활성 바 높이
  dotSize?: number;       // 일반 비활성 점 지름(인접/가장자리 규칙 적용 전 기본값)
  activeWidth?: number;   // 활성 바 길이
  activeColor?: string;   // 기본 colors.primary.main
  inactiveColor?: string; // 기본 colors.button
  neighborDotSize?: number; // 활성 양옆 점 크기 (기본 6)
  edgeDotSize?: number;     // 첫/끝 점 크기 (기본 4)
  style?: ViewStyle;
};

/** 점 + 알약형 활성 바 페이지네이션 (인접/가장자리 점 크기 규칙 포함) */
export const Pagination: React.FC<PaginationProps> = memo(
  ({
    total,
    current,
    gap = 4,
    height = 6,
    dotSize = 6,
    activeWidth = 28,
    activeColor = colors.primary.main,
    inactiveColor = colors.button,
    neighborDotSize = 6,
    edgeDotSize = 4,
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

          if (isActive) {
            // 활성 알약
            return (
              <View
                key={i}
                style={[
                  styles.active,
                  {
                    width: activeWidth,
                    height,
                    backgroundColor: activeColor,
                    borderRadius: height / 2,
                  },
                ]}
                accessibilityState={{ selected: true }}
                accessible
              />
            );
          }

          // 비활성 점: 인접/가장자리 규칙 적용
          const isNeighbor = Math.abs(i - clamped) === 1;
          const isEdge = i === 0 || i === total - 1;

          const size = isNeighbor
            ? neighborDotSize // 활성 양옆
            : isEdge
            ? edgeDotSize     // 첫/끝
            : dotSize;        // 그 외 일반

          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: size,
                  height: size,
                  backgroundColor: inactiveColor,
                  borderRadius: size / 2,
                },
              ]}
              accessibilityState={{ selected: false }}
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
