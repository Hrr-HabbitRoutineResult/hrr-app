import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View } from 'react-native';
import { OptionGroup, OptionItem } from '../../onboarding/OptionGroup';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof OptionGroup> = {
  title: 'Components/Onboarding/OptionGroup',
  component: OptionGroup,
  parameters: {
    layout: 'padded', // Use padded layout for better visualization
  },
  argTypes: {
    title: { control: 'text', description: '그룹 제목' },
    options: { control: 'object', description: '옵션 목록 (id, label 객체 또는 문자열 배열)' },
    selectedOptions: { control: 'object', description: '선택된 옵션 ID 배열' },
    onOptionSelect: { action: 'onOptionSelect', description: '옵션 선택 시 호출되는 콜백' },
    multiSelect: { control: 'boolean', description: '다중 선택 허용 여부' },
  },
  decorators: [
    (Story) => (
      <View style={{ width: '100%', paddingHorizontal: 20, backgroundColor: '#f0f0f0' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OptionGroup>;

const mockOptions1: OptionItem[] = [
  { id: 'option1', label: '옵션 1' },
  { id: 'option2', label: '옵션 2' },
  { id: 'option3', label: '옵션 3' },
  { id: 'option4', label: '옵션 4' },
];

const mockOptions2: string[] = ['항목 A', '항목 B', '항목 C', '항목 D', '항목 E'];

export const SingleSelect: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>(args.selectedOptions || []);

    const handleSelect = (id: string) => {
      let newSelection: string[];
      if (args.multiSelect) {
        newSelection = selected.includes(id)
          ? selected.filter(item => item !== id)
          : [...selected, id];
      } else {
        newSelection = [id]; // Single select
      }
      setSelected(newSelection);
      action('onOptionSelect')(id);
    };

    return <OptionGroup {...args} selectedOptions={selected} onOptionSelect={handleSelect} />;
  },
  args: {
    title: '단일 선택 옵션',
    options: mockOptions1,
    selectedOptions: ['option2'],
    multiSelect: false,
  },
};

export const MultiSelect: Story = {
  render: SingleSelect.render, // Reuse render function
  args: {
    title: '다중 선택 옵션',
    options: mockOptions1,
    selectedOptions: ['option1', 'option3'],
    multiSelect: true,
  },
};

export const MixedOptionsInput: Story = {
  render: SingleSelect.render, // Reuse render function
  args: {
    title: '문자열 배열 옵션',
    options: mockOptions2,
    selectedOptions: ['항목 B'],
    multiSelect: false,
  },
};

export const MultiSelectNoInitial: Story = {
  render: SingleSelect.render,
  args: {
    title: '다중 선택 (초기 선택 없음)',
    options: mockOptions1,
    selectedOptions: [],
    multiSelect: true,
  },
};
