// src/components/stories/mypage/Avatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '../../common/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/MyPage/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    uri: {
      control: 'text',
      description: '프로필 이미지 URL (없으면 기본 아이콘 표시)',
    },
    size: {
      control: { type: 'number', min: 24, max: 120, step: 4 },
      description: '아바타 크기',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  args: {
    uri: 'https://i.pravatar.cc/150?u=storybook',
    size: 80,
  },
};

export const WithImage: Story = {
  args: {
    uri: 'https://i.pravatar.cc/150?u=with-image',
    size: 80,
  },
};

export const WithoutImage: Story = {
  args: {
    uri: undefined,
    size: 80,
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={styles.row}>
      <Avatar size={32} />
      <Avatar size={40} />
      <Avatar size={48} />
      <Avatar size={64} />
      <Avatar size={80} />
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
});
