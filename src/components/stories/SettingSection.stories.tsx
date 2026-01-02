import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import SettingSection from '../MyPage/SettingSection';
import SettingItem from '../MyPage/SettingItem';
import PersonIcon from '../../../assets/icons/person.svg';
import ScrapIcon from '../../../assets/icons/scrap.svg';
import CheckboxCheckedIcon from '../../../assets/icons/checkbox-checked.svg';
import { colors } from '../../design/tokens';

const meta: Meta<typeof SettingSection> = {
  title: 'Components/MyPage/SettingSection',
  component: SettingSection,
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: colors.background, flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SettingSection>;

export const Default: Story = {
  args: {
    children: (
      <>
        <SettingItem
          label="계정 설정"
          icon={<PersonIcon width={24} height={24} />}
          onPress={() => console.log('Pressed')}
        />
      </>
    ),
  },
};

export const Titled: Story = {
  args: {
    title: '챌린지',
    children: (
      <>
        <SettingItem
          label="찜한 챌린지"
          icon={<ScrapIcon width={24} height={24} />}
          onPress={() => console.log('Pressed')}
        />
        <SettingItem
          label="종료된 챌린지"
          icon={<CheckboxCheckedIcon width={24} height={24} />}
          onPress={() => console.log('Pressed')}
        />
      </>
    ),
  },
};
