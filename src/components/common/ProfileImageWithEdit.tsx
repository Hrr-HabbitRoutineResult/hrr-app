// src/components/MyPage/ProfileImageWithEdit.tsx
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import EditProfileIcon from '../../../assets/icons/camera-white.svg';
import { colors as Color } from '../../design/tokens';

interface ProfileImageWithEditProps {
  profileImageUrl?: string;
  onPress: () => void;
  size?: number; // default 100
  overlayOpacity?: number; // default 0.35
}

const ProfileImageWithEdit: React.FC<ProfileImageWithEditProps> = ({
  profileImageUrl,
  onPress,
  size = 100,
  overlayOpacity = 0.35,
}) => {
  const r = size / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, { width: size, height: size, borderRadius: r }]}
    >
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={[styles.profileImage, { borderRadius: r }]} />
      ) : (
        <View style={[styles.profileImagePlaceholder, { borderRadius: r }]} />
      )}

      {/* ✅ 사진 전체 덮는 오버레이 */}
      <View
        pointerEvents="none"
        style={[
          styles.fullOverlay,
          { borderRadius: r, backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
        ]}
      />

      {/* ✅ 오버레이 중앙 아이콘 */}
      <View pointerEvents="none" style={styles.centerIconWrap}>
        <EditProfileIcon width={32} height={32} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.icon.gray,
    position: 'relative',
    overflow: 'hidden', // ✅ 원형 밖으로 오버레이/아이콘 안 나가게
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Color.icon.gray,
  },

  fullOverlay: {
    ...StyleSheet.absoluteFillObject, // ✅ 전체 덮기
  },

  centerIconWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileImageWithEdit;
