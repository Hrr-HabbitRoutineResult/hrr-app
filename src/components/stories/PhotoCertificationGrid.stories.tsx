
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { PhotoCertificationGrid, PhotoCertificationItem } from '../common/PhotoCertificationGrid';

const meta: Meta<typeof PhotoCertificationGrid> = {
  title: 'Components/Common/PhotoCertificationGrid',
  component: PhotoCertificationGrid,
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onItemPress: { action: 'item-pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof PhotoCertificationGrid>;

const mockItems: PhotoCertificationItem[] = [
  { id: 1, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
  { id: 2, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
  { id: 3, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
  { id: 4, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
  { id: 5, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
  { id: 6, thumbnail: { uri: 'https://i.ibb.co/99v0c3S/mock-challenge-profile.png' } },
];

export const Default: Story = {
  args: {
    items: mockItems,
  },
};

export const WithContainerPadding: Story = {
    args: {
      items: mockItems,
      containerPadding: 20,
    },
  };
  
export const FewerItems: Story = {
    args: {
      items: mockItems.slice(0, 2),
    },
  };
