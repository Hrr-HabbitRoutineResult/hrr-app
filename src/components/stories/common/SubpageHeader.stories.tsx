import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import SubpageHeader from '../../common/SubpageHeader';
import MoreIcon from '../../../../assets/icons/more.svg';

const meta: Meta<typeof SubpageHeader> = {
  title: 'Components/Common/SubpageHeader',
  component: SubpageHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    onBackPress: { action: 'back-pressed' },
    rightContent: { control: 'object' },
  },
  args: {
    title: '페이지 제목',
  }
};

export default meta;

type Story = StoryObj<typeof SubpageHeader>;

export const Default: Story = {
  args: {
    // onBackPress만 있는 경우
    onBackPress: () => console.log('Back pressed'),
  },
};

export const WithRightContent: Story = {
  args: {
    onBackPress: () => console.log('Back pressed'),
    rightContent: <MoreIcon width="24" height="24" />,
  },
};

export const WithoutBackButton: Story = {
    args: {
      rightContent: <MoreIcon width="24" height="24" />,
    },
  };
