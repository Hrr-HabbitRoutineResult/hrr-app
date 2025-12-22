
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import CustomTabBar from '../common/CustomTabBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, TabNavigationState } from '@react-navigation/native';

const meta: Meta<typeof CustomTabBar> = {
  title: 'Components/CustomTabBar',
  component: CustomTabBar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CustomTabBar>;

const mockNavigation = {
  emit: () => ({
    type: 'tabPress',
    target: '홈',
    canPreventDefault: true,
    defaultPrevented: false,
  }),
  navigate: (name: string) => console.log('Navigate to', name),
} as unknown as NavigationHelpers<any, any>;

const routeNames = ['홈', '검색', '채팅', '마이'];

const createMockState = (activeIndex: number): TabNavigationState<any> => ({
  index: activeIndex,
  key: 'tab-bar',
  routeNames,
  routes: routeNames.map(name => ({ key: `${name}-key`, name, params: {} })),
  stale: false,
  type: 'tab',
});

const createMockDescriptors = () => {
    const descriptors: any = {};
    routeNames.forEach(name => {
      descriptors[`${name}-key`] = {
        options: {},
        render: () => <View />,
      };
    });
    return descriptors;
  };

const mockProps: BottomTabBarProps = {
  state: createMockState(0),
  descriptors: createMockDescriptors(),
  navigation: mockNavigation,
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
};

export const Default: Story = {
  render: (args) => {
    const activeIndex = args.state?.index ?? 0;
    const state = createMockState(activeIndex);
    return <CustomTabBar {...mockProps} state={state} />;
  },
  args: {
    state: createMockState(0),
  },
  argTypes: {
    'state.index': {
      name: 'Active Tab Index',
      control: {
        type: 'select',
      },
      options: [0, 1, 2, 3],
    }
  }
};
