import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BadgeRow, BadgeImage } from '../../MyPage/BadgeRow';

const meta: Meta<typeof BadgeRow> = {
  title: 'Components/MyPage/BadgeRow',
  component: BadgeRow,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    badges: {
      control: 'object',
      description: '뱃지 이미지 URL 목록',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BadgeRow>;

const mockBadgeImages: BadgeImage[] = [
  { uri: 'https://i.pravatar.cc/40?img=1' },
  { uri: 'https://i.pravatar.cc/40?img=2' },
  { uri: 'https://i.pravatar.cc/40?img=3' },
];

export const Default: Story = {
  args: {
    badges: mockBadgeImages,
  },
};

export const NoBadges: Story = {
  args: {
    badges: [],
  },
};

export const ManyBadges: Story = {
  args: {
    badges: [
      { uri: 'https://i.pravatar.cc/40?img=4' },
      { uri: 'https://i.pravatar.cc/40?img=5' },
      { uri: 'https://i.pravatar.cc/40?img=6' },
      { uri: 'https://i.pravatar.cc/40?img=7' },
      { uri: 'https://i.pravatar.cc/40?img=8' },
      { uri: 'https://i.pravatar.cc/40?img=9' },
      { uri: 'https://i.pravatar.cc/40?img=10' },
      { uri: 'https://i.pravatar.cc/40?img=11' },
    ],
  },
};
