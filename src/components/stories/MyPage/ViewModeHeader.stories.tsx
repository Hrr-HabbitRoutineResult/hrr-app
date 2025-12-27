import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import ViewModeHeader from '../../MyPage/ViewModeHeader';

const meta: Meta<typeof ViewModeHeader> = {
  title: 'Components/MyPage/ViewModeHeader',
  component: ViewModeHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    onPressTitle: { action: 'title-pressed' },
    onViewModeChange: { action: 'view-mode-changed' },
    initialMode: {
      control: 'radio',
      options: ['grid', 'view'],
    },
  },
  args: {
    title: '인증 기록',
    onPressTitle: () => console.log('Title pressed'),
  }
};

export default meta;

type Story = StoryObj<typeof ViewModeHeader>;

export const DefaultGridMode: Story = {
  args: {
    initialMode: 'grid',
  },
};

export const DefaultViewMode: Story = {
  args: {
    initialMode: 'view',
  },
};
