import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Button as RNButton, Text as RNText } from 'react-native'; // Renamed Button to RNButton to avoid conflict
import { action } from '@storybook/addon-actions';
import { VerificationDaysSheet } from '../../create-challenge/VerificationDaysSheet';

const meta: Meta<typeof VerificationDaysSheet> = {
  title: 'Components/CreateChallenge/VerificationDaysSheet',
  component: VerificationDaysSheet,
  parameters: {
    layout: 'fullscreen', // Sheets typically cover the full screen or a large portion
  },
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      const [currentSelectedDays, setCurrentSelectedDays] = useState<string[]>(['MONDAY', 'WEDNESDAY']); // To display confirmed value

      const handleConfirm = (days: string[]) => {
        setCurrentSelectedDays(days);
        action('onConfirm')(days);
        // Note: The component itself calls onConfirm on toggle.
        // This decorator's onConfirm is primarily for logging and closing if needed.
      };

      const handleClose = () => {
        action('onClose')();
        setIsVisible(false);
      };

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ marginBottom: 20 }}>
            Selected Days: {currentSelectedDays.join(', ') || 'None'}
          </RNText>
          <RNButton title="Open Days Sheet" onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: handleClose, onConfirm: handleConfirm, selectedDays: currentSelectedDays }} />
        </View>
      );
    },
  ],
  argTypes: {
    selectedDays: {
      control: 'object',
      description: '초기 선택된 요일 배열 (예: ["MONDAY", "WEDNESDAY"])',
    },
    visible: { control: 'boolean', table: { disable: true } }, // Controlled by decorator
    onClose: { action: 'onClose', table: { disable: true } }, // Controlled by decorator
    onConfirm: { action: 'onConfirm', table: { disable: true } }, // Controlled by decorator
  },
};

export default meta;

type Story = StoryObj<typeof VerificationDaysSheet>;

export const Default: Story = {
  args: {
    // Initial selectedDays passed via decorator args
  },
};

export const AllDaysSelected: Story = {
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      const [currentSelectedDays, setCurrentSelectedDays] = useState<string[]>(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);

      const handleConfirm = (days: string[]) => {
        setCurrentSelectedDays(days);
        action('onConfirm')(days);
      };

      const handleClose = () => {
        action('onClose')();
        setIsVisible(false);
      };

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ marginBottom: 20 }}>
            Selected Days: {currentSelectedDays.join(', ') || 'None'}
          </RNText>
          <RNButton title="Open Days Sheet (All Selected)" onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: handleClose, onConfirm: handleConfirm, selectedDays: currentSelectedDays }} />
        </View>
      );
    },
  ],
  args: {
    // selectedDays handled by decorator
  },
};

export const NoDaysSelected: Story = {
    decorators: [
        (Story) => {
          const [isVisible, setIsVisible] = useState(false);
          const [currentSelectedDays, setCurrentSelectedDays] = useState<string[]>([]);
    
          const handleConfirm = (days: string[]) => {
            setCurrentSelectedDays(days);
            action('onConfirm')(days);
          };
    
          const handleClose = () => {
            action('onClose')();
            setIsVisible(false);
          };
    
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <RNText style={{ marginBottom: 20 }}>
                Selected Days: {currentSelectedDays.join(', ') || 'None'}
              </RNText>
              <RNButton title="Open Days Sheet (No Selected)" onPress={() => setIsVisible(true)} />
              <Story args={{ visible: isVisible, onClose: handleClose, onConfirm: handleConfirm, selectedDays: currentSelectedDays }} />
            </View>
          );
        },
      ],
      args: {
        // selectedDays handled by decorator
      },
};
