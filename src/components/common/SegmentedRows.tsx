import React, { memo } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { scale, verticalScale } from 'react-native-size-matters'
import { colors } from '../../design/tokens'

export type SegmentedRowsProps = {
  /** 전체 컴포넌트 가로폭 */
  width?: number            // 기본 350
  /** 행 수 */
  rows?: number             // 기본 1 (요구사항: 바 하나 기준)
  /** 열(한 줄의 세그먼트) 수 */
  cols?: number             // 기본 1 (요구사항: 바 하나 기준)
  /** 각 행의 활성(컬러) 개수. 길이가 rows보다 짧으면 나머지는 0으로 간주 */
  activePerRow?: number[]   // 예: [1,2,3,3]
  /** 세그먼트 사이 간격 */
  gap?: number              // 기본 10
  /** 선(바) 두께 = Figma Border 두께 */
  strokeWidth?: number      // 기본 6 (Height 0 + Border 6px을 시각적으로 구현)
  /** 비활성 바 색상 */
  inactiveColor?: string    // 기본 colors.line
  /** 활성 바 색상 */
  activeColor?: string      // 기본 colors.primary.main
  /** 컨테이너 추가 스타일 */
  style?: ViewStyle
  /** 가운데 정렬 강제 (기본 true) */
  center?: boolean
}

/**
 * 행(row) x 열(col) 형태의 '선형 알약 바' 묶음.
 * - Figma "Height 0 + Border 6px" 스타일을 RN에서 시각적으로 동일하게 보이도록
 *   실제 렌더는 height = strokeWidth, borderRadius = strokeWidth/2 로 구현.
 */
export const SegmentedRows: React.FC<SegmentedRowsProps> = memo(
  ({
    width = scale(350),
    rows = 1,
    cols = 1,
    activePerRow = [1],
    gap = scale(10),
    strokeWidth = verticalScale(6),
    inactiveColor = colors.line,
    activeColor = colors.primary?.main ?? '#FF6B61',
    style,
    center = true
  }) => {
    if (!Number.isFinite(width) || width <= 0) return null
    if (!Number.isFinite(rows) || rows <= 0) return null
    if (!Number.isFinite(cols) || cols <= 0) return null

    // 각 세그먼트의 가로 길이 계산 (gap 고려)
    const itemWidth = (width - gap * (cols - 1)) / cols
    const radius = strokeWidth / 2
    const safeActiveAt = (r: number) =>
      Math.max(0, Math.min(activePerRow[r] ?? 0, cols))

    return (
      <View
        style={[
          styles.container,
          center && { alignSelf: 'center' }, // Center alignment
          { width, rowGap: gap },
          style
        ]}
        accessibilityLabel={`세그먼트 행 ${rows}개, 각 행 ${cols}개`}
      >
        {Array.from({ length: rows }).map((_, r) => {
          const activeCount = safeActiveAt(r)
          return (
            <View
              key={`row-${r}`}
              style={[styles.row, { columnGap: gap }]}
              accessible
              accessibilityLabel={`${r + 1}번째 행, 활성 ${activeCount}개`}
            >
              {Array.from({ length: cols }).map((__, c) => {
                const isActive = c < activeCount
                return (
                  <View
                    key={`r${r}c${c}`}
                    style={[
                      styles.segment,
                      {
                        width: itemWidth,
                        height: strokeWidth,             // Figma Height 0 + Border 6px 대체
                        borderRadius: radius,
                        backgroundColor: isActive ? activeColor : inactiveColor
                      }
                    ]}
                    accessibilityState={{ selected: isActive }}
                  />
                )
              })}
            </View>
          )
        })}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    // center=true면 alignSelf로 중앙정렬, 아니면 부모 스타일 따름
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  segment: {
    opacity: 1
  }
})

export default SegmentedRows
