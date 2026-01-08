import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import ComponentHeader from '../common/ComponentHeader';

const meta: Meta<typeof ComponentHeader> = {
  title: 'Components/Common/ComponentHeader',
  component: ComponentHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    onPress: { action: 'pressed' },
  },
  args: {
    title: '헤더 타이틀',
  }
};

export default meta;

type Story = StoryObj<typeof ComponentHeader>;

export const Default: Story = {
  args: {
    // onPress가 없으면 아이콘이 보이지 않음
  },
};

export const WithAction: Story = {
  args: {
    onPress: () => console.log('Header pressed'),
  },
};
