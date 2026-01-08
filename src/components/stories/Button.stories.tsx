// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Button } from '../common/Button'
import { colors, typography } from '../../design/tokens' // typography 추가
import CommentIcon from '../../../assets/icons/comment.svg' // 아이콘 임포트

const meta: Meta<typeof Button> = {
  title: 'Components/Common/Button',//
  component: Button,
  parameters: {
    layout: 'centered',                  // 가운데 정렬
    controls: { expanded: true },
    actions: { argTypesRegex: '^on.*' }  // onPress 자동 액션 바인딩
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['black', 'primary', 'white', 'gray', 'outlinePrimary']
    },
    size: {
      control: 'inline-radio',
      options: ['small', 'medium']
    },
    disabled: { control: 'boolean' },
    // children: { control: 'text' }, // children은 Playground에서만 text로 제어
    style: { control: false } // style은 객체라 컨트롤 비활성화
  }
}
export default meta

type Story = StoryObj<typeof Button>

/** 기본 플레이그라운드: 컨트롤 패널로 실시간 조절 */
export const Playground: Story = {
  args: {
    children: '확인', // string literal for playground
    variant: 'primary',
    size: 'medium',
    disabled: false,
    onPress: () => {}
  },
  argTypes: {
    children: { control: 'text' }, // Explicitly define for Playground
  }
}

/** 주요 상태 한 번에 보기 */
export const Variants: Story = {
  render: () => (
    <View style={styles.row}>
      <Button variant="primary" size="medium" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="black" size="medium" onPress={() => {}}>
        Black
      </Button>
      <Button variant="white" size="medium" onPress={() => {}}>
        White
      </Button>
      <Button variant="gray" size="medium" onPress={() => {}}>
        Gray
      </Button>
      <Button variant="outlinePrimary" size="medium" onPress={() => {}}>
        Outline Primary
      </Button>
    </View>
  )
}

/** 크기 비교 */
export const Sizes: Story = {
  render: () => (
    <View style={styles.row}>
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
    <View style={styles.row}>
      <Button variant="primary" disabled onPress={() => {}}>
        Primary Disabled
      </Button>
      <Button variant="white" disabled onPress={() => {}}>
        White Disabled
      </Button>
      <Button variant="black" disabled onPress={() => {}}>
        Black Disabled
      </Button>
      <Button variant="gray" disabled onPress={() => {}}>
        Gray Disabled
      </Button>
      <Button variant="outlinePrimary" disabled onPress={() => {}}>
        Outline Primary Disabled
      </Button>
    </View>
  )
}

/** 스타일 오버라이드 예시: width 커스텀 */
export const CustomWidth: Story = {
  render: () => (
    <View style={styles.row}>
      <Button variant="primary" size="small" style={{ width: 240 }} onPress={() => {}}>
        Small → 240
      </Button>
      <Button variant="primary" size="medium" style={{ width: 420 }} onPress={() => {}}>
        Medium → 420
      </Button>
    </View>
  )
}

/** 아이콘과 함께 사용 */
export const WithIcon: Story = {
  render: () => (
    <View style={styles.row}>
      <Button variant="primary" size="small" onPress={() => {}}>
        <View style={styles.iconButtonContent}>
          <CommentIcon width={16} height={16} fill={colors.white} />
          <RNText style={styles.iconButtonText(colors.white)}></RNText>
        </View>
      </Button>
      <Button variant="white" size="small" onPress={() => {}}>
        <View style={styles.iconButtonContent}>
          <CommentIcon width={16} height={16} fill={colors.text.tertiary} />
          <RNText style={styles.iconButtonText(colors.text.tertiary)}>메시지</RNText>
        </View>
      </Button>
      <Button variant="outlinePrimary" size="small" onPress={() => {}}>
        <View style={styles.iconButtonContent}>
          <CommentIcon width={16} height={16} fill={colors.primary.main} />
          <RNText style={styles.iconButtonText(colors.primary.main)}>댓글</RNText>
        </View>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  iconButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButtonText: (color: string) => ({
    ...typography.md,
    color: color,
  }),
});
