import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import { ChallengeSuggestButton } from '../../home/ChallengeSuggestButton';

const meta: Meta<typeof ChallengeSuggestButton> = {
  title: 'Components/Home/ChallengeSuggestButton',
  component: ChallengeSuggestButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onPress: { action: 'onPress', description: '버튼 클릭 이벤트' },
  },
};

export default meta;

type Story = StoryObj<typeof ChallengeSuggestButton>;

export const Default: Story = {
  args: {
    onPress: action('Challenge Suggest Button Clicked'),
  },
};
