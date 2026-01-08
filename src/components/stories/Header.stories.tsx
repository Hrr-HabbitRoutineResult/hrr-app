
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Header } from '../common/Header';
import { colors } from '../../design/tokens';

const meta: Meta<typeof Header> = {
  title: 'Components/Common/Header',
  component: Header,
  decorators: [
    (Story) => (
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onBack: { action: 'onBack' },
    title: { control: 'text' },
    showDivider: { control: 'boolean' },
    rightContent: { control: 'object' },
    useSafeArea: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Basic: Story = {
  args: {
    title: '챌린지 개설',
  },
};

export const WithBackButton: Story = {
  args: {
    title: '챌린지 상세',
    onBack: () => alert('Back pressed!'),
  },
};

export const WithRightContent: Story = {
  args: {
    title: '알림',
    onBack: () => alert('Back pressed!'),
    rightContent: (
      <TouchableOpacity onPress={() => alert('Settings pressed!')}>
        <Text style={{ color: colors.primary.main }}>편집</Text>
      </TouchableOpacity>
    ),
  },
};

export const WithDivider: Story = {
  args: {
    title: '프로필 수정',
    onBack: () => alert('Back pressed!'),
    showDivider: true,
  },
};

export const NoTitle: Story = {
    args: {
      onBack: () => alert('Back pressed!'),
      rightContent: (
        <TouchableOpacity onPress={() => alert('Close pressed!')}>
          <Text style={{ fontSize: 24 }}>X</Text>
        </TouchableOpacity>
      ),
    },
  };

export const WithSafeArea: Story = {
    args: {
        title: 'Safe Area Header',
        onBack: () => alert('Back pressed!'),
        useSafeArea: true,
        showDivider: true,
    },
    decorators: [
        (Story) => (
          <View style={{ flex: 1, alignSelf: 'stretch', borderWidth: 1, borderColor: 'red' }}>
            <Story />
          </View>
        ),
      ],
};
