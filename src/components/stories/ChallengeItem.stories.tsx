
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import ChallengeItem from '../common/ChallengeItem';

const meta: Meta<typeof ChallengeItem> = {
  title: 'Components/Common/ChallengeItem',
  component: ChallengeItem,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: '#f0f0f0' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof ChallengeItem>;

const defaultArgs = {
  challengeId: 1,
  thumbnailUrl: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png',
  title: '매일 1만보 걷기 챌린지',
  description: '건강을 위한 첫걸음, 함께 걸어요!',
  daysText: '매일',
  currentParticipantCount: 7,
  maxParticipantCount: 10,
  onPress: () => {},
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const WithDday: Story = {
  args: {
    ...defaultArgs,
    ddayUntilStart: 3,
  },
};

export const WithRank: Story = {
  args: {
    ...defaultArgs,
    rank: 1,
  },
};

export const Full: Story = {
  args: {
    ...defaultArgs,
    currentParticipantCount: 10,
    maxParticipantCount: 10,
  },
};

export const DdayZero: Story = {
    args: {
      ...defaultArgs,
      ddayUntilStart: 0,
    },
  };
  
export const LongText: Story = {
    args: {
        ...defaultArgs,
        title: '아주아주 긴 챌린지 제목입니다. 이 제목은 화면을 넘어갈 수도 있습니다.',
        description: '이 챌린지에 대한 설명도 엄청나게 깁니다. 과연 어떻게 보일까요? 한 번 확인해보시죠.',
    },
};
