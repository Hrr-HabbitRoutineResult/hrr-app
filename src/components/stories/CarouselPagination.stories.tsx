
import type { Meta, StoryObj } from '@storybook/react';
import { CarouselPagination } from '../common/CarouselPagination';

const meta: Meta<typeof CarouselPagination> = {
  title: 'Components/Common/CarouselPagination',
  component: CarouselPagination,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    currentIndex: {
      control: { type: 'number', min: 0 },
    },
    totalItems: {
      control: { type: 'number', min: 1 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CarouselPagination>;

export const Default: Story = {
  args: {
    currentIndex: 0,
    totalItems: 5,
  },
};
