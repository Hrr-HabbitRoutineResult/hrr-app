import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import PopularList from '../../home/PopularList';
import { DailyTopChallengeItem } from '../../../libs/api/challenge';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof PopularList> = {
  title: 'Components/Home/PopularList',
  component: PopularList,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  argTypes: {
    challenges: {
      control: 'object',
      description: '인기 챌린지 아이템 배열',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ width: '100%', paddingHorizontal: 20, backgroundColor: '#f0f0f0' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PopularList>;

const mockDailyTopChallenges: DailyTopChallengeItem[] = [
  {
    ranking: 1,
    clickCount: 1500,
    info: {
      challengeId: 101,
      title: '매일 아침 스트레칭',
      description: '건강한 하루의 시작!',
      currentParticipantCount: 25,
      maxParticipantCount: 30,
      isUpcoming: false,
      daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      thumbnailUrl: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png',
      ddayUntilStart: 0,
    },
  },
  {
    ranking: 2,
    clickCount: 1200,
    info: {
      challengeId: 102,
      title: '하루 30분 독서',
      description: '지식의 숲으로 떠나는 여행',
      currentParticipantCount: 18,
      maxParticipantCount: 20,
      isUpcoming: false,
      daysOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      thumbnailUrl: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png',
      ddayUntilStart: 0,
    },
  },
  {
    ranking: 3,
    clickCount: 900,
    info: {
      challengeId: 103,
      title: '퇴근 후 스페인어 공부',
      description: '새로운 언어에 도전해보세요',
      currentParticipantCount: 12,
      maxParticipantCount: 15,
      isUpcoming: true,
      daysOfWeek: ['TUESDAY', 'THURSDAY'],
      thumbnailUrl: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png',
      ddayUntilStart: 5,
    },
  },
];

export const Default: Story = {
  args: {
    challenges: mockDailyTopChallenges,
  },
};

export const EmptyState: Story = {
  args: {
    challenges: [],
  },
};
