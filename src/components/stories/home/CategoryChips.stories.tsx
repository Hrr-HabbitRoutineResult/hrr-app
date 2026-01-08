import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import CategoryChips from '../../home/CategoryChips';
import { action } from '@storybook/addon-actions'; // For logging navigation actions if needed

const meta: Meta<typeof CategoryChips> = {
  title: 'Components/Home/CategoryChips',
  component: CategoryChips,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  // To handle useNavigation, a decorator can be used to mock it.
  // For simplicity, we'll just let the onPress actions log if triggered.
  // In a real app, you might mock it like:
  // decorators: [
  //   (Story) => (
  //     <NavigationContainer>
  //       <Story />
  //     </NavigationContainer>
  //   ),
  // ],
};

export default meta;

type Story = StoryObj<typeof CategoryChips>;

export const Default: Story = {
  // Since CategoryChips handles navigation internally, we don't pass props here.
  // The component will render its fixed set of categories.
  args: {},
};
