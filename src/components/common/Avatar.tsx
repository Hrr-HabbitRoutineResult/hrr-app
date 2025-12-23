// src/components/common/Avatar.tsx
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../design/tokens';

// 추가: 기본 프로필 SVG
import ProfileDefaultIcon from '../../../assets/icons/mypage/profile-default.svg';

interface AvatarProps {
  uri?: string;
  size: number;
}

export const Avatar = ({ uri, size }: AvatarProps) => {
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // uri가 있으면 원래대로 이미지 사용
  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} />;
  }

  // uri가 없으면 기본 SVG 아이콘 표시
  return (
    <View style={[styles.placeholder, style]}>
      {/* 아이콘 크기는 아바타에 맞춰 적당히 비율로 */}
      <ProfileDefaultIcon width={size} height={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.line,
  },
  placeholder: {
    backgroundColor: colors.line,
    borderWidth: 1,
    borderColor: colors.button,
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center', // 가운데 정렬
    overflow: 'hidden', // 원형 밖으로 나가는 부분 잘라내기
  },
});
