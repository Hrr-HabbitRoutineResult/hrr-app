import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { ProgressBar } from '../../onboarding/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Onboarding/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 0 },
      description: '현재 진행 단계',
    },
    totalSteps: {
      control: { type: 'number', min: 1 },
      description: '총 단계 수',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ width: '100%', backgroundColor: '#f0f0f0', paddingVertical: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    currentStep: 1,
    totalSteps: 5,
  },
};

export const HalfProgress: Story = {
  args: {
    currentStep: 3,
    totalSteps: 5,
  },
};

export const FullProgress: Story = {
  args: {
    currentStep: 5,
    totalSteps: 5,
  },
};

export const NoProgress: Story = {
  args: {
    currentStep: 0,
    totalSteps: 5,
  },
};

export const DifferentTotalSteps: Story = {
  args: {
    currentStep: 2,
    totalSteps: 3,
  },
};
