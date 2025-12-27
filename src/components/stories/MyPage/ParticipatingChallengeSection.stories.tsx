import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import ParticipatingChallengeSection, {
  ParticipatingChallengeItem,
} from '../../MyPage/ParticipatingChallengeSection';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof ParticipatingChallengeSection> = {
  title: 'Components/MyPage/ParticipatingChallengeSection',
  component: ParticipatingChallengeSection,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization of horizontal list
  },
  argTypes: {
    title: { control: 'text', description: '섹션 제목' },
    items: { control: 'object', description: '참가중인 챌린지 아이템 목록' },
    onPressHeader: { action: 'header-pressed', description: '헤더 클릭 시 이벤트' },
    onPressItem: { action: 'item-pressed', description: '챌린지 아이템 클릭 시 이벤트' },
  },
};

export default meta;

type Story = StoryObj<typeof ParticipatingChallengeSection>;

const mockItems: ParticipatingChallengeItem[] = [
  {
    id: '1',
    title: '매일 아침 운동',
    subtitle: '7시 기상 후 헬스장 가기',
    imageUrl: 'https://picsum.photos/id/237/200/300',
    roundText: '6R째 진행 중',
  },
  {
    id: '2',
    title: '하루 물 2L 마시기',
    subtitle: '꾸준한 수분 섭취로 건강 UP!',
    imageUrl: 'https://picsum.photos/id/238/200/300',
    roundText: '3R째 진행 중',
  },
  {
    id: '3',
    title: '주 3회 독서',
    subtitle: '지적 성장 챌린지',
    imageUrl: 'https://picsum.photos/id/239/200/300',
    roundText: '1R째 진행 중',
  },
  {
    id: '4',
    title: '영어 단어 50개 암기',
    subtitle: '매일 꾸준히 어휘력 향상',
    imageUrl: 'https://picsum.photos/id/240/200/300',
    roundText: '2R째 진행 중',
  },
];

export const Default: Story = {
  args: {
    title: '참가중인 챌린지',
    items: mockItems,
    onPressHeader: action('header-pressed'),
    onPressItem: action('item-pressed'),
  },
};

export const CustomTitle: Story = {
  args: {
    ...Default.args,
    title: '나의 챌린지 여정',
  },
};

export const EmptyState: Story = {
  args: {
    title: '참가중인 챌린지',
    items: [],
    onPressHeader: action('header-pressed'),
  },
};
