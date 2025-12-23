
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SortSelector } from '../common/SortSelector';
import { useArgs } from '@storybook/preview-api';

const meta: Meta<typeof SortSelector> = {
  title: 'Components/Common/SortSelector',
  component: SortSelector,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    selectedSort: {
      control: 'radio',
      options: ['POPULAR', 'LATEST', 'OLDEST', ''],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SortSelector>;

export const Default: Story = {
    render: function Render(args) {
        const [{ selectedSort }, updateArgs] = useArgs();
        
        const onSortChange = (newSort: string) => {
            updateArgs({ selectedSort: newSort });
        };

        return <SortSelector {...args} selectedSort={selectedSort} onSortChange={onSortChange} />;
    },
  args: {
    selectedSort: 'POPULAR',
  },
};
