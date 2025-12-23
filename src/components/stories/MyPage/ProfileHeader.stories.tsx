import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileHeader } from '../../MyPage/ProfileHeader';

const meta: Meta<typeof ProfileHeader> = {
  title: 'Components/MyPage/ProfileHeader',
  component: ProfileHeader,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    nickname: { control: 'text', description: '사용자 닉네임' },
    avatarUrl: { control: 'text', description: '아바타 이미지 URL' },
    followerCount: { control: 'number', description: '팔로워 수' },
    followingCount: { control: 'number', description: '팔로잉 수' },
    profileTypeText: { control: 'text', description: '프로필 타입 텍스트 (예: 챌린저)' },
  },
};

export default meta;

type Story = StoryObj<typeof ProfileHeader>;

export const Default: Story = {
  args: {
    nickname: '해빗',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    followerCount: 150,
    followingCount: 88,
    profileTypeText: '챌린저',
  },
};

export const NoAvatar: Story = {
  args: {
    nickname: '기본 아바타',
    followerCount: 50,
    followingCount: 20,
    profileTypeText: '일반인',
  },
};

export const LongNickname: Story = {
  args: {
    nickname: '아주아주긴닉네임을가진유저',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    followerCount: 1000,
    followingCount: 500,
    profileTypeText: '챌린저 마스터',
  },
};

export const DifferentProfileType: Story = {
  args: {
    nickname: '특별한유저',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704a',
    followerCount: 200,
    followingCount: 100,
    profileTypeText: '관리자',
  },
};
