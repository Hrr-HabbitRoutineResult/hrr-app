import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Button as RNButton } from 'react-native'; // Renamed Button to RNButton to avoid conflict
import { action } from '@storybook/addon-actions';
import { MaxParticipantsSheet } from '../../CreateChallenge/MaxParticipantsSheet';

const meta: Meta<typeof MaxParticipantsSheet> = {
  title: 'Components/CreateChallenge/MaxParticipantsSheet',
  component: MaxParticipantsSheet,
  parameters: {
    layout: 'fullscreen', // Sheets typically cover the full screen or a large portion
  },
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      const [selectedValue, setSelectedValue] = useState(10); // To display confirmed value

      const handleConfirm = (count: number) => {
        setSelectedValue(count);
        action('onConfirm')(count);
        setIsVisible(false);
      };

      const handleClose = () => {
        action('onClose')();
        setIsVisible(false);
      };

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RNButton title={`Open Sheet (Value: ${selectedValue})`} onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: handleClose, onConfirm: handleConfirm }} />
        </View>
      );
    },
  ],
  argTypes: {
    initialValue: {
      control: { type: 'number', min: 1, max: 30, step: 1 },
      description: '초기 선택될 정원 값',
    },
    visible: { control: 'boolean', table: { disable: true } }, // Controlled by decorator
    onClose: { action: 'onClose', table: { disable: true } }, // Controlled by decorator
    onConfirm: { action: 'onConfirm', table: { disable: true } }, // Controlled by decorator
  },
};

export default meta;

type Story = StoryObj<typeof MaxParticipantsSheet>;

export const Default: Story = {
  args: {
    initialValue: 10,
  },
};

export const InitialValue20: Story = {
  args: {
    initialValue: 20,
  },
};

export const InitialValue3: Story = {
  args: {
    initialValue: 3,
  },
};
