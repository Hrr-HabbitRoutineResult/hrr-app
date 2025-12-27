import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import { SocialLoginButton } from '../../auth/SocialLoginButton';

const meta: Meta<typeof SocialLoginButton> = {
  title: 'Components/Auth/SocialLoginButton',
  component: SocialLoginButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    provider: {
      control: 'select',
      options: ['apple', 'naver', 'kakao'],
      description: '소셜 로그인 제공자',
    },
    onPress: { action: 'onPress', description: '버튼 클릭 이벤트' },
  },
};

export default meta;

type Story = StoryObj<typeof SocialLoginButton>;

export const AppleLogin: Story = {
  args: {
    provider: 'apple',
    onPress: action('Apple Login Clicked'),
  },
};

export const NaverLogin: Story = {
  args: {
    provider: 'naver',
    onPress: action('Naver Login Clicked'),
  },
};

export const KakaoLogin: Story = {
  args: {
    provider: 'kakao',
    onPress: action('Kakao Login Clicked'),
  },
};
