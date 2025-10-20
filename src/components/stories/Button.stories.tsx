// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { View } from 'react-native'
import { Button } from '../common/Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',                  // 가운데 정렬
    controls: { expanded: true },
    actions: { argTypesRegex: '^on.*' }  // onPress 자동 액션 바인딩
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['black', 'primary', 'white']
    },
    size: {
      control: 'inline-radio',
      options: ['small', 'medium']
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    style: { control: false } // style은 객체라 컨트롤 비활성화
  }
}
export default meta

type Story = StoryObj<typeof Button>

/** 기본 플레이그라운드: 컨트롤 패널로 실시간 조절 */
export const Playground: Story = {
  args: {
    children: '확인',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    onPress: () => {}
  }
}

/** 주요 상태 한 번에 보기 */
export const Variants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary" size="medium" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="black" size="medium" onPress={() => {}}>
        Black
      </Button>
      <Button variant="white" size="medium" onPress={() => {}}>
        White
      </Button>
    </View>
  )
}

/** 크기 비교 */
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary" size="small" onPress={() => {}}>
        Small 170
      </Button>
      <Button variant="primary" size="medium" onPress={() => {}}>
        Medium 350
      </Button>
    </View>
  )
}

/** 비활성화 상태 */
export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary" disabled onPress={() => {}}>
        Primary Disabled
      </Button>
      <Button variant="white" disabled onPress={() => {}}>
        White Disabled
      </Button>
      <Button variant="black" disabled onPress={() => {}}>
        Black Disabled
      </Button>
    </View>
  )
}

/** 스타일 오버라이드 예시: width 커스텀 */
export const CustomWidth: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary" size="small" style={{ width: 240 }} onPress={() => {}}>
        Small → 240
      </Button>
      <Button variant="primary" size="medium" style={{ width: 420 }} onPress={() => {}}>
        Medium → 420
      </Button>
    </View>
  )
}
