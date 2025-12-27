import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import ChallengeCarousel from '../../home/ChallengeCarousel';
import { Challenge } from '../../../libs/api/challenge';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof ChallengeCarousel> = {
  title: 'Components/Home/ChallengeCarousel',
  component: ChallengeCarousel,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  argTypes: {
    challenges: {
      control: 'object',
      description: '챌린지 아이템 배열',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ width: '100%', height: 300, justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ChallengeCarousel>;

const mockChallenges: Challenge[] = [
  {
    id: 1,
    thumbnail: 'https://i.pravatar.cc/150?img=1',
    title: '매일 아침 운동',
    todayEligible: true,
  },
  {
    id: 2,
    thumbnail: 'https://i.pravatar.cc/150?img=2',
    title: '하루 물 2L 마시기',
    todayEligible: false,
  },
  {
    id: 3,
    thumbnail: 'https://i.pravatar.cc/150?img=3',
    title: '주 3회 독서',
    todayEligible: true,
  },
  {
    id: 4,
    thumbnail: 'https://i.pravatar.cc/150?img=4',
    title: '영어 단어 50개 암기',
    todayEligible: false,
  },
];

export const Default: Story = {
  args: {
    challenges: mockChallenges,
  },
};

export const EmptyState: Story = {
  args: {
    challenges: [],
  },
};

export const SingleItem: Story = {
  args: {
    challenges: [mockChallenges[0]],
  },
};
