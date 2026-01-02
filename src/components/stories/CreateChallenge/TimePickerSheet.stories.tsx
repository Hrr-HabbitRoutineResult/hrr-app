import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Button as RNButton, Text as RNText } from 'react-native'; // Renamed Button to RNButton to avoid conflict
import { action } from '@storybook/addon-actions';
import { TimePickerSheet } from '../../create-challenge/TimePickerSheet';

const meta: Meta<typeof TimePickerSheet> = {
  title: 'Components/CreateChallenge/TimePickerSheet',
  component: TimePickerSheet,
  parameters: {
    layout: 'fullscreen', // Sheets typically cover the full screen or a large portion
  },
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      const [selectedTime, setSelectedTime] = useState<{ period: 'AM' | 'PM'; hour: string; minute: string }>({ period: 'AM', hour: '12', minute: '00' }); // To display confirmed value

      const handleConfirm = (time: { period: 'AM' | 'PM'; hour: string; minute: string }) => {
        setSelectedTime(time);
        action('onConfirm')(time);
        setIsVisible(false);
      };

      const handleClose = () => {
        action('onClose')();
        setIsVisible(false);
      };

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ marginBottom: 20 }}>
            Selected Time: {selectedTime.period} {selectedTime.hour}:{selectedTime.minute}
          </RNText>
          <RNButton title="Open Time Picker" onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: handleClose, onConfirm: handleConfirm }} />
        </View>
      );
    },
  ],
  argTypes: {
    title: { control: 'text', description: '시트 제목' },
    initialTime: {
      control: 'object',
      description: '초기 시간 (period, hour, minute)',
    },
    visible: { control: 'boolean', table: { disable: true } }, // Controlled by decorator
    onClose: { action: 'onClose', table: { disable: true } }, // Controlled by decorator
    onConfirm: { action: 'onConfirm', table: { disable: true } }, // Controlled by decorator
  },
};

export default meta;

type Story = StoryObj<typeof TimePickerSheet>;

export const Default: Story = {
  args: {
    title: '시간을 선택해 주세요',
    initialTime: { period: 'AM', hour: '12', minute: '00' },
  },
};

export const CustomInitialTime: Story = {
  args: {
    title: '종료 시간을 선택해 주세요',
    initialTime: { period: 'PM', hour: '03', minute: '30' },
  },
};
