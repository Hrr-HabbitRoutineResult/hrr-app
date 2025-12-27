import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Button as RNButton, Text as RNText } from 'react-native'; // Renamed Button to RNButton to avoid conflict
import { action } from '@storybook/addon-actions';
import { VerificationMethodSheet } from '../../CreateChallenge/VerificationMethodSheet';

const meta: Meta<typeof VerificationMethodSheet> = {
  title: 'Components/CreateChallenge/VerificationMethodSheet',
  component: VerificationMethodSheet,
  parameters: {
    layout: 'fullscreen', // Sheets typically cover the full screen or a large portion
  },
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      const [currentSelectedMethod, setCurrentSelectedMethod] = useState<'photo' | 'text' | ''>(''); // To display confirmed value

      const handleSelect = (method: 'photo' | 'text') => {
        setCurrentSelectedMethod(method);
        action('onSelect')(method);
        setIsVisible(false);
      };

      const handleClose = () => {
        action('onClose')();
        setIsVisible(false);
      };

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ marginBottom: 20 }}>
            Selected Method: {currentSelectedMethod || 'None'}
          </RNText>
          <RNButton title="Open Method Sheet" onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: handleClose, onSelect: handleSelect, selectedMethod: currentSelectedMethod }} />
        </View>
      );
    },
  ],
  argTypes: {
    selectedMethod: {
      control: 'radio',
      options: ['photo', 'text', ''], // Include '' for no initial selection
      description: '초기 선택된 인증 수단',
    },
    visible: { control: 'boolean', table: { disable: true } }, // Controlled by decorator
    onClose: { action: 'onClose', table: { disable: true } }, // Controlled by decorator
    onSelect: { action: 'onSelect', table: { disable: true } }, // Controlled by decorator
  },
};

export default meta;

type Story = StoryObj<typeof VerificationMethodSheet>;

export const Default: Story = {
  args: {
    selectedMethod: '', // No initial selection
  },
};

export const PhotoSelected: Story = {
  args: {
    selectedMethod: 'photo',
  },
};

export const TextSelected: Story = {
  args: {
    selectedMethod: 'text',
  },
};
