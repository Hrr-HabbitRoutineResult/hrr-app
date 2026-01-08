import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ProfileCard, { Level } from '../../MyPage/ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/MyPage/ProfileCard',
  component: ProfileCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    'user.nickname': { control: 'text', description: '사용자 닉네임' },
    'user.avatarUrl': { control: 'text', description: '아바타 이미지 URL' },
    'user.followerCount': { control: 'number', description: '팔로워 수' },
    'user.followingCount': { control: 'number', description: '팔로잉 수' },
    'user.level': {
      control: { type: 'select', options: Object.values(Level).filter(value => typeof value === 'number') },
      description: '유저 레벨',
    },
    variant: {
      control: 'inline-radio',
      options: ['me', 'other'],
      description: '프로필 카드 종류 (내 프로필 / 다른 사람 프로필)',
    },
    isFollowing: {
      control: 'boolean',
      description: '다른 유저일 경우, 팔로우 상태',
      if: { arg: 'variant', eq: 'other' },
    },
    isBlocked: {
      control: 'boolean',
      description: '다른 유저일 경우, 차단 상태',
      if: { arg: 'variant', eq: 'other' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProfileCard>;

const mockUserMe = {
  nickname: '해빗',
  followerCount: 150,
  followingCount: 88,
  level: Level.CHALLENGER,
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

const mockUserOther = {
  nickname: '다른유저',
  followerCount: 30,
  followingCount: 37,
  level: Level.BRONZE,
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
};

export const Playground: Story = {
  args: {
    user: mockUserMe,
    variant: 'me',
    isFollowing: false,
    isBlocked: false,
  },
};

export const MyProfile: Story = {
  name: '1) 내 프로필',
  args: {
    user: mockUserMe,
    variant: 'me',
  },
};

export const OtherUserFollowing: Story = {
  name: '2) 팔로우 하고 있는 상대',
  args: {
    user: mockUserOther,
    variant: 'other',
    isFollowing: true,
    isBlocked: false,
  },
};

export const OtherUserToFollow: Story = {
  name: '3) 팔로우 하고 있지 않은 상대',
  args: {
    user: mockUserOther,
    variant: 'other',
    isFollowing: false,
    isBlocked: false,
  },
};

export const BlockedUser: Story = {
  name: '4) 차단된 유저',
  args: {
    user: mockUserOther,
    variant: 'other',
    isFollowing: false,
    isBlocked: true,
  },
};