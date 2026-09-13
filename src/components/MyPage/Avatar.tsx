import React from 'react';
import { ProfileImage } from '../common/ProfileImage';

interface AvatarProps {
  uri?: string | null;
  size: number;
}

export const Avatar = ({ uri, size }: AvatarProps) => {
  return <ProfileImage uri={uri} size={size} />;
};
