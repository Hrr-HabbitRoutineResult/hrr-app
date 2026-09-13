import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import EditProfileIcon from '../../../assets/icons/camera-white.svg';
import { colors as Color } from '../../design/tokens';
import { ProfileImage } from './ProfileImage';

interface ProfileImageWithEditProps {
  profileImageUrl?: string | null;
  onPress: () => void;
  size?: number;
  overlayOpacity?: number;
  iconSize?: number;
}

const ProfileImageWithEdit: React.FC<ProfileImageWithEditProps> = ({
  profileImageUrl,
  onPress,
  size = 100,
  overlayOpacity = 0.35,
  iconSize = 32,
}) => {
  const r = size / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, { width: size, height: size, borderRadius: r }]}
    >
      <ProfileImage uri={profileImageUrl} size={size} />

      {/* 사진 전체 덮는 오버레이 */}
      <View
        pointerEvents="none"
        style={[
          styles.fullOverlay,
          { borderRadius: r, backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
        ]}
      />

      {/* 오버레이 중앙 아이콘 */}
      <View pointerEvents="none" style={styles.centerIconWrap}>
        <EditProfileIcon width={iconSize} height={iconSize} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.icon.gray,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  centerIconWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileImageWithEdit;
