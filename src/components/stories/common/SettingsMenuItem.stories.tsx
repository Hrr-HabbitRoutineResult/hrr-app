import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import SettingsMenuItem from '../../common/SettingsMenuItem';
import PersonIcon from '../../../../assets/icons/person.svg';

const meta: Meta<typeof SettingsMenuItem> = {
  title: 'Components/Common/SettingsMenuItem',
  component: SettingsMenuItem,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignSelf: 'stretch' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    text: { control: 'text' },
    onPress: { action: 'pressed' },
  },
  args: {
    text: '메뉴 아이템',
    icon: <PersonIcon />,
  }
};

export default meta;

type Story = StoryObj<typeof SettingsMenuItem>;

export const Default: Story = {
  args: {
    onPress: () => console.log('Menu Item Pressed'),
  },
};

export const WithoutAction: Story = {
    args: {
      onPress: undefined,
    },
  };
