// src/components/common/TextField.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { View, ViewStyle } from 'react-native'
import { TextField } from '../common/TextField'
import { colors } from '../../design/tokens'

function CircleIcon({ size = 18, color = colors.icon.gray, style }: { size?: number; color?: string; style?: ViewStyle }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style
      ]}
    />
  )
}

const meta: Meta<typeof TextField> = {
  title: 'Components/Common/TextField',
  component: TextField,
  parameters: { layout: 'centered', controls: { expanded: true } },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'white']
    },
    placeholder: { control: 'text' },
    message: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onLeftIconPress: { action: 'onLeftIconPress' },
    onRightIconPress: { action: 'onRightIconPress' },
    style: { control: false },
    containerStyle: { control: false }
  }
}
export default meta

type Story = StoryObj<typeof TextField>

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <TextField
        {...args}
        value={value}
        onChangeText={setValue}
      />
    )
  },
  args: {
    variant: 'default',
    placeholder: '입력하세요',
    message: '힌트 메시지 예시'
  }
}

export const WithIcons: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <TextField
        {...args}
        value={value}
        onChangeText={setValue}
        leftIcon={<CircleIcon color={colors.primary.main} />}
        rightIcon={<CircleIcon color={colors.icon.gray} />}
      />
    )
  },
  args: {
    variant: 'white',
    placeholder: '아이콘 있는 입력창',
    message: '오른쪽 아이콘을 눌러보세요'
  }
}

export const States: Story = {
  render: () => {
    const [v1, setV1] = useState('기본 상태')
    const [v2, setV2] = useState('비활성화')
    const [v3, setV3] = useState('에러 상태')

    return (
      <View style={{ gap: 16, width: 360 }}>
        <TextField
          variant="default"
          value={v1}
          onChangeText={setV1}
          placeholder="기본"
          message="메시지 예시"
        />
        <TextField
          variant="white"
          value={v2}
          onChangeText={setV2}
          disabled
          placeholder="비활성화"
          message="disabled 상태"
        />
        <TextField
          variant="white"
          value={v3}
          onChangeText={setV3}
          placeholder="에러"
          error="형식이 올바르지 않습니다"
        />
      </View>
    )
  }
}

export const WidthOverride: Story = {
  render: () => {
    const [v1, setV1] = useState('')
    const [v2, setV2] = useState('')
    return (
      <View style={{ gap: 16 }}>
        <TextField
          variant="default"
          value={v1}
          onChangeText={setV1}
          placeholder="320px"
          containerStyle={{ width: 320 }}
        />
        <TextField
          variant="white"
          value={v2}
          onChangeText={setV2}
          placeholder="480px"
          containerStyle={{ width: 480 }}
        />
      </View>
    )
  }
}
