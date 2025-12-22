
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DaySelector } from '../common/DaySelector';
import { useArgs } from '@storybook/preview-api';

const meta: Meta<typeof DaySelector> = {
  title: 'Components/DaySelector',
  component: DaySelector,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    selectedDays: {
      control: 'check',
      options: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof DaySelector>;

export const Default: Story = {
    render: function Render(args) {
        const [{ selectedDays }, updateArgs] = useArgs();
        
        const onDaysChange = (newDays: string[]) => {
            updateArgs({ selectedDays: newDays });
        };

        return <DaySelector {...args} selectedDays={selectedDays} onDaysChange={onDaysChange} />;
    },
  args: {
    selectedDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
  },
};
