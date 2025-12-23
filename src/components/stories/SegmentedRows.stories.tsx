import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View, Pressable, Text } from 'react-native'
import SegmentedRows, { SegmentedRowsProps } from '../common/SegmentedRows'
import { colors } from '../../design/tokens'

const meta: Meta<typeof SegmentedRows> = {
  title: 'Components/Common/SegmentedRows',
  component: SegmentedRows,
  parameters: { layout: 'centered', controls: { expanded: true } },
  argTypes: {
    width: { control: { type: 'number', min: 40, step: 2 } },
    rows: { control: { type: 'number', min: 1, step: 1 } },
    cols: { control: { type: 'number', min: 1, step: 1 } },
    activePerRow: { control: 'object' },
    gap: { control: { type: 'number', min: 0, step: 1 } },
    strokeWidth: { control: { type: 'number', min: 1, step: 1 } },
    activeColor: { control: 'color' },
    inactiveColor: { control: 'color' },
    center: { control: 'boolean' },
    style: { control: false }
  }
}
export default meta

type Story = StoryObj<typeof SegmentedRows>

/**
 * Figma 서식 그대로:
 * - Width: 80px
 * - Height: 0px (RN에선 strokeWidth로 대체)
 * - Border: 6px (→ strokeWidth=6)
 * - Color: hrr/primary (#FF6B61)
 * - Center alignment
 */
export const FigmaSpecBar: Story = {
  args: {
    width: 80,
    rows: 1,
    cols: 1,
    activePerRow: [1],
    gap: 10,
    strokeWidth: 6,
    activeColor: (colors.primary?.main ?? '#FF6B61'),
    inactiveColor: colors.line,
    center: true
  }
}

/** 여러 칸으로 쪼갠 바(같은 서식, 활성 개수만 변경) */
export const Segmented4: Story = {
  args: {
    width: 350,
    rows: 1,
    cols: 4,
    activePerRow: [2],            // 왼쪽부터 2칸 활성
    gap: 6,
    strokeWidth: 6,
    activeColor: (colors.primary?.main ?? '#FF6B61'),
    inactiveColor: colors.line,
    center: true
  }
}

/** 행/열 변형 프리셋 */
export const Presets: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <SegmentedRows width={80} rows={1} cols={1} activePerRow={[1]} strokeWidth={6} />
      <SegmentedRows width={120} rows={1} cols={4} activePerRow={[3]} strokeWidth={6} gap={8} />
      <SegmentedRows width={200} rows={2} cols={5} activePerRow={[1, 4]} strokeWidth={6} gap={8} />
    </View>
  )
}

/** 인터랙티브: 활성 개수 증감 */
export const Interactive: Story = {
  render: (args: SegmentedRowsProps) => {
    const rows = args.rows ?? 1
    const cols = args.cols ?? 4
    const [active, setActive] = useState<number[]>(
      Array.from({ length: rows }, (_, i) => Math.min((args.activePerRow?.[i] ?? 1), cols))
    )
    const clamp = (n: number) => Math.max(0, Math.min(n, cols))

    return (
      <View style={{ gap: 16, alignItems: 'center' }}>
        <SegmentedRows {...args} rows={rows} cols={cols} activePerRow={active} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => setActive(a => a.map((v, i) => i === 0 ? clamp(v - 1) : v))}
            style={btn}
          >
            <Text style={btnText}>Row1 -</Text>
          </Pressable>
          <Pressable
            onPress={() => setActive(a => a.map((v, i) => i === 0 ? clamp(v + 1) : v))}
            style={btn}
          >
            <Text style={btnText}>Row1 +</Text>
          </Pressable>
        </View>
        <Text>{`Row1: ${active[0]}/${cols}`}</Text>
      </View>
    )
  },
  args: {
    width: 120,
    rows: 1,
    cols: 4,
    activePerRow: [2],
    gap: 6,
    strokeWidth: 6,
    activeColor: (colors.primary?.main ?? '#FF6B61'),
    inactiveColor: colors.line,
    center: true
  }
}

const btn = { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1f6feb', borderRadius: 8 }
const btnText = { color: 'white', fontWeight: '600' }
