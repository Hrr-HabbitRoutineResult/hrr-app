// src/components/MyPage/Avatar.tsx
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../../design/tokens';
import { getS3ImageUrl } from '../../libs/s3'; // 헬퍼 함수 임포트

// 추가: 기본 프로필 SVG
import ProfileDefaultIcon from '../../../assets/icons/mypage/profile-default.svg';

interface AvatarProps {
  uri?: string | null;
  size: number;
}

export const Avatar = ({ uri, size }: AvatarProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageUrl = getS3ImageUrl(uri); // S3 키를 전체 URL로 변환

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  // 전체 imageUrl을 사용하여 이미지 렌더링
  if (imageUrl && !hasImageError) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, style]}
        onError={() => setHasImageError(true)}
      />
    );
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
