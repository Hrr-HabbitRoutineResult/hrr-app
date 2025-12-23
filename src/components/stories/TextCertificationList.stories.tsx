
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { TextCertificationList, TextCertificationItem } from '../common/TextCertificationList';

const meta: Meta<typeof TextCertificationList> = {
  title: 'Components/Common/TextCertificationList',
  component: TextCertificationList,
  decorators: [
    (Story) => (
      <View style={{ paddingTop: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onItemPress: { action: 'item-pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof TextCertificationList>;

const mockItems: TextCertificationItem[] = [
  { 
    id: 1, 
    title: '오늘의 독서 인증', 
    description: '오늘은 "리액트 네이티브"를 30분 읽었습니다. 아주 유익한 시간이었어요.',
    date: '2023.12.18',
    thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } 
  },
  { 
    id: 2, 
    title: '아침 조깅 인증', 
    description: '상쾌한 아침! 오늘도 3km 조깅 완료!',
    date: '2023.12.18',
    thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } 
  },
  { 
    id: 3, 
    title: '물 2L 마시기 성공', 
    description: '하루 종일 꾸준히 마셨더니 피부가 좋아지는 기분이에요.',
    date: '2023.12.17',
    thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } 
  },
];

export const Default: Story = {
  args: {
    items: mockItems,
  },
};

export const WithContainerPadding: Story = {
    args: {
      items: mockItems,
      containerPadding: 0,
    },
  };
  
export const SingleItem: Story = {
    args: {
      items: mockItems.slice(0, 1),
    },
  };
