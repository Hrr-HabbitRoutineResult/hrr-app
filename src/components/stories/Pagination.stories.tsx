import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useRef, useState } from 'react'
import { View, Pressable, Text } from 'react-native'
import Pagination from '../common/Pagination'

// Pagination 컴포넌트의 props 타입 추론
type Props = React.ComponentProps<typeof Pagination>

const meta: Meta<Props> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'centered', controls: { expanded: true } },
  argTypes: {
    total: { control: { type: 'number', min: 1, step: 1 } },
    current: { control: { type: 'number', min: 0, step: 1 } },
    gap: { control: { type: 'number', min: 0, step: 1 } },
    height: { control: { type: 'number', min: 2, step: 1 } },
    dotSize: { control: { type: 'number', min: 2, step: 1 } },
    activeWidth: { control: { type: 'number', min: 6, step: 1 } },
    activeColor: { control: 'color' },
    inactiveColor: { control: 'color' },
    style: { control: false },
  },
}
export default meta

type Story = StoryObj<Props>

/** 컨트롤 패널로 모든 props를 바로 만져보는 기본 스토리 */
export const Playground: Story = {
  args: {
    total: 5,
    current: 0,
    gap: 6,
    height: 6,
    dotSize: 6,
    activeWidth: 28,
  },
}

/** 이전/다음 버튼과 함께 동작을 확인하는 인터랙티브 스토리 */
export const WithControls: Story = {
  render: (args) => {
    const total = Math.max(1, args.total ?? 1)
    const [idx, setIdx] = useState(
      Math.min(args.current ?? 0, Math.max(0, total - 1)),
    )

    const prev = () => setIdx((i) => (i - 1 + total) % total)
    const next = () => setIdx((i) => (i + 1) % total)

    return (
      <View style={{ gap: 16, alignItems: 'center' }}>
        <Pagination {...args} current={idx} total={total} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={prev} style={btnStyle}>
            <Text style={btnText}>이전</Text>
          </Pressable>
          <Pressable onPress={next} style={btnStyle}>
            <Text style={btnText}>다음</Text>
          </Pressable>
        </View>
        <Text>{`${idx + 1} / ${total}`}</Text>
      </View>
    )
  },
  args: {
    total: 6,
    current: 0,
    gap: 6,
    height: 6,
    dotSize: 6,
    activeWidth: 28,
  },
}

/** 자동 재생(오토플레이) 데모: 일정 주기로 current가 증가 */
export const AutoPlay: Story = {
  render: (args) => {
    const total = Math.max(1, args.total ?? 1)
    const [idx, setIdx] = useState(0)
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
      if (timer.current) clearInterval(timer.current)
      timer.current = setInterval(() => {
        setIdx((i) => (i + 1) % total)
      }, 1000)
      return () => {
        if (timer.current) clearInterval(timer.current)
      }
    }, [total])

    return (
      <View style={{ gap: 16, alignItems: 'center' }}>
        <Pagination {...args} current={idx} total={total} />
        <Text>{`${idx + 1} / ${total} (자동)`}</Text>
      </View>
    )
  },
  args: {
    total: 4,
    gap: 6,
    height: 6,
    dotSize: 6,
    activeWidth: 32,
  },
}

const btnStyle = {
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: '#1f6feb',
  borderRadius: 8,
} as const

const btnText = { color: 'white', fontWeight: '600' } as const
