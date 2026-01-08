import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import RandomMissionBanner from '../../home/RandomMissionBanner';
import { action } from '@storybook/addon-actions';
import { useUserStore } from '../../../store/userSlice'; // Import original store
import { create } from 'zustand'; // For mocking zustand

// Mock useNavigation
const mockNavigate = action('navigate');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the Zustand store for Storybook
// This allows us to control the `randomMissionCompleted` state for stories
const useMockUserStore = create(set => ({
  nickname: '게스트',
  randomMissionCompleted: false,
  setNickname: (nickname) => set({ nickname }),
  setRandomMissionCompleted: (completed) => set({ randomMissionCompleted: completed }),
}));

const meta: Meta<typeof RandomMissionBanner> = {
  title: 'Components/Home/RandomMissionBanner',
  component: RandomMissionBanner,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  decorators: [
    (Story, { args }) => {
      // Set the mock store's state based on args
      useMockUserStore.setState({ randomMissionCompleted: args.isCompleted });
      return (
        <View style={{ width: '100%', paddingHorizontal: 20, backgroundColor: '#f0f0f0' }}>
          <Story />
        </View>
      );
    },
  ],
  argTypes: {
    // This is a dummy argType to control the mocked state
    isCompleted: {
      control: 'boolean',
      description: '미션 완료 상태 (스토리북 테스트용)',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof RandomMissionBanner>;

export const DefaultNotCompleted: Story = {
  args: {
    isCompleted: false,
  },
};

export const MissionCompleted: Story = {
  args: {
    isCompleted: true,
  },
};
