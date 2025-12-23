// src/components/common/Text.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { View } from 'react-native'
import { Text } from '../common/Text'
import { colors } from '../../design/tokens'

const meta: Meta<typeof Text> = {
  title: 'Components/Common/Text',
  component: Text,
  parameters: { layout: 'centered', controls: { expanded: true } },
  argTypes: {
    variant: {
      control: 'text',
      description: 'typography 객체의 키를 입력하세요. 예: smMd, caption, xsReg'
    },
    color: {
      control: 'color'
    },
    children: { control: 'text' },
    style: { control: false }
  }
}
export default meta

type Story = StoryObj<typeof Text>

export const Playground: Story = {
  args: {
    variant: 'smMd',
    color: colors.text.primary,
    children: 'Hello Text'
  }
}

export const VariantsPreview: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text variant="smMd" color={colors.text.primary}>
        smMd 예시 텍스트
      </Text>
      <Text variant="caption" color={colors.text.secondary}>
        caption 예시 텍스트
      </Text>
      <Text variant="xsReg" color={colors.text.tertiary}>
        xsReg 예시 텍스트
      </Text>
    </View>
  )
}

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text variant="smMd" color={colors.text.primary}>
        Primary
      </Text>
      <Text variant="smMd" color={colors.text.secondary}>
        Secondary
      </Text>
      <Text variant="smMd" color={colors.text.tertiary}>
        Tertiary
      </Text>
      <Text variant="smMd" color={colors.primary.main}>
        Brand Primary
      </Text>
    </View>
  )
}
