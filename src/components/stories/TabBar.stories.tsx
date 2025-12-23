
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TabBar, TabItem } from '../common/TabBar';
import { useArgs } from '@storybook/preview-api';
import { View } from 'react-native';

const meta: Meta<typeof TabBar> = {
  title: 'Components/Common/TabBar',
  component: TabBar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
        <View style={{ alignSelf: 'stretch' }}>
          <Story />
        </View>
      ),
  ],
  argTypes: {
    activeTab: {
      control: 'select',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TabBar>;

const fixedTabs: TabItem[] = [
  { key: 'my-challenges', label: '내 챌린지' },
  { key: 'scrapped', label: '스크랩' },
];

const scrollableTabs: TabItem[] = [
    { key: 'all', label: '전체' },
    { key: 'routine', label: '루틴' },
    { key: 'self-dev', label: '자기계발' },
    { key: 'health', label: '건강' },
    { key: 'hobby', label: '취미' },
    { key: 'env', label: '환경' },
];

export const FixedTabs: Story = {
    render: function Render(args) {
        const [{ activeTab }, updateArgs] = useArgs();
        
        const onTabChange = (newTab: string) => {
            updateArgs({ activeTab: newTab });
        };

        return <TabBar {...args} activeTab={activeTab} onTabChange={onTabChange} />;
    },
  args: {
    tabs: fixedTabs,
    activeTab: 'my-challenges',
    scrollable: false,
  },
  argTypes: {
    activeTab: {
        options: fixedTabs.map(t => t.key),
    }
  }
};

export const ScrollableTabs: Story = {
    render: function Render(args) {
        const [{ activeTab }, updateArgs] = useArgs();
        
        const onTabChange = (newTab: string) => {
            updateArgs({ activeTab: newTab });
        };

        return <TabBar {...args} activeTab={activeTab} onTabChange={onTabChange} />;
    },
    args: {
      tabs: scrollableTabs,
      activeTab: 'all',
      scrollable: true,
    },
    argTypes: {
        activeTab: {
            options: scrollableTabs.map(t => t.key),
        }
      }
  };
