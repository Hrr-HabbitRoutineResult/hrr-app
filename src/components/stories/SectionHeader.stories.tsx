
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import SectionHeader from '../common/SectionHeader';

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    actionText: { control: 'text' },
    onActionPress: { action: 'pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
    title: '인기 챌린지',
  },
};

export const WithAction: Story = {
  args: {
    title: '내 챌린지',
    actionText: '더보기',
  },
};
