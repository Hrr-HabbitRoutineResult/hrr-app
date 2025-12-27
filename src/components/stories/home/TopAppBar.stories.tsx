import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import TopAppBar from '../../home/TopAppBar';
import { action } from '@storybook/addon-actions';

// Mock useNavigation
const mockNavigate = action('navigate');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock useSafeAreaInsets
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({
    top: 40, // Example value for top inset
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

const meta: Meta<typeof TopAppBar> = {
  title: 'Components/Home/TopAppBar',
  component: TopAppBar,
  parameters: {
    layout: 'fullscreen', // Top app bar typically takes full width
  },
  // Decorator to provide a background for better visibility
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TopAppBar>;

export const Default: Story = {
  // TopAppBar does not take any props directly, so args are empty
  args: {},
};
