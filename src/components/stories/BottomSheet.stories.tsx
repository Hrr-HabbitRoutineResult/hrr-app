
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';

const meta: Meta<typeof BottomSheet> = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const [isVisible, setIsVisible] = useState(false);
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button title="Open BottomSheet" onPress={() => setIsVisible(true)} />
          <Story args={{ visible: isVisible, onClose: () => setIsVisible(false) }} />
        </View>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  args: {
    children: (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
          This is a BottomSheet
        </Text>
        <Text style={{ marginBottom: 10 }}>
          You can put any content you want here.
        </Text>
        <Text style={{ marginBottom: 10 }}>
          For example, a list of options, a form, or just some information.
        </Text>
        <Button title="Close" onPress={() => {}} />
      </View>
    ),
  },
};
