import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import SettingItem from '../MyPage/SettingItem';
import PersonIcon from '../../../assets/icons/person.svg';
import { colors } from '../../design/tokens';

const meta: Meta<typeof SettingItem> = {
  title: 'Components/MyPage/SettingItem',
  component: SettingItem,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: colors.background }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof SettingItem>;

export const Default: Story = {
  args: {
    label: '계정 설정',
    icon: <PersonIcon width={24} height={24} />,
    onPress: () => console.log('Setting Item Pressed'),
  },
};
