import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View, Pressable, Text } from 'react-native'
import SegmentedRows, { SegmentedRowsProps } from '../common/SegmentRows'

const meta: Meta<typeof SegmentedRows> = {
  title: 'Components/SegmentedRows',
  component: SegmentedRows,
  parameters: { layout: 'centered', controls: { expanded: true } },
  argTypes: {
    width: { control: { type: 'number', min: 100, step: 10 } },
    rows: { control: { type: 'number', min: 1, step: 1 } },
    cols: { control: { type: 'number', min: 1, step: 1 } },
    activePerRow: {
      control: 'object',
      description: '각 행의 활성 개수 배열 (예: [1,2,3,3])'
    },
    gap: { control: { type: 'number', min: 0, step: 1 } },
    segmentHeight: { control: { type: 'number', min: 4, step: 1 } },
    activeWidth: { control: false },      // 컴포넌트에는 없음(혼동 방지)
    height: { control: false },           // 컴포넌트에는 없음(혼동 방지)
    dotSize: { control: false },          // 컴포넌트에는 없음(혼동 방지)
    activeColor: { control: 'color' },
    inactiveColor: { control: 'color' },
    style: { control: false }
  }
}
export default meta

type Story = StoryObj<typeof SegmentedRows>

/** 모든 prop을 컨트롤로 만져볼 수 있는 기본 스토리 */
export const Playground: Story = {
  args: {
    width: 350,
    rows: 4,
    cols: 4,
    activePerRow: [1, 2, 3, 3],
    gap: 10,
    segmentHeight: 10
  }
}

/** 다양한 프리셋을 한 화면에서 비교 */
export const Presets: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text>기본 4x4</Text>
        <SegmentedRows width={350} rows={4} cols={4} activePerRow={[1,2,3,3]} />
      </View>
      <View style={{ gap: 8 }}>
        <Text>3x6 (활성 증가)</Text>
        <SegmentedRows width={380} rows={3} cols={6} activePerRow={[2,3,5]} />
      </View>
      <View style={{ gap: 8 }}>
        <Text>5x5 (계단형)</Text>
        <SegmentedRows width={360} rows={5} cols={5} activePerRow={[1,2,3,4,5]} />
      </View>
    </View>
  )
}

/** 폭 변화에 따른 분배 확인 */
export const WidthVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <SegmentedRows width={260} rows={4} cols={4} activePerRow={[1,2,3,3]} />
      <SegmentedRows width={320} rows={4} cols={4} activePerRow={[1,2,3,3]} />
      <SegmentedRows width={420} rows={4} cols={4} activePerRow={[1,2,3,3]} />
    </View>
  )
}

/** 인터랙티브: 버튼으로 활성 세그먼트 증감 */
export const Interactive: Story = {
  render: (args: SegmentedRowsProps) => {
    const rows = args.rows ?? 4
    const cols = args.cols ?? 4
    const [arr, setArr] = useState<number[]>(
      Array.from({ length: rows }, (_, i) => Math.min((args.activePerRow?.[i] ?? i + 1), cols))
    )

    const inc = (r: number) =>
      setArr(a => a.map((v, i) => (i === r ? Math.min(v + 1, cols) : v)))
    const dec = (r: number) =>
      setArr(a => a.map((v, i) => (i === r ? Math.max(v - 1, 0) : v)))

    return (
      <View style={{ gap: 16, alignItems: 'center' }}>
        <SegmentedRows {...args} activePerRow={arr} rows={rows} cols={cols} />
        <View style={{ gap: 8 }}>
          {arr.map((v, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text>{`Row ${i + 1}: ${v}`}</Text>
              <Pressable onPress={() => dec(i)} style={btn}><Text style={btnText}>-</Text></Pressable>
              <Pressable onPress={() => inc(i)} style={btn}><Text style={btnText}>+</Text></Pressable>
            </View>
          ))}
        </View>
      </View>
    )
  },
  args: {
    width: 350,
    rows: 4,
    cols: 4,
    activePerRow: [1, 2, 3, 3],
    gap: 10,
    segmentHeight: 10
  }
}

/** 색상 테마 미리보기 */
export const Colors: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <SegmentedRows width={340} rows={4} cols={4} activePerRow={[1,2,3,3]} />
      <SegmentedRows
        width={340}
        rows={4}
        cols={4}
        activePerRow={[0,1,1,4]}
        activeColor="#ef4444"     // 빨강
        inactiveColor="#e5e7eb"   // 밝은 회색
      />
      <SegmentedRows
        width={340}
        rows={4}
        cols={4}
        activePerRow={[4,3,2,1]}
        activeColor="#10b981"     // 초록
        inactiveColor="#94a3b8"   // 회색
      />
    </View>
  )
}

const btn = { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1f6feb', borderRadius: 8 }
const btnText = { color: 'white', fontWeight: '600' }
