import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getS3ImageUrl } from '../../libs/s3';
import ProfilePlaceholder from '../../../assets/icons/ranking/profile-placeholder.svg';

interface ProfileImageProps {
  uri?: string | null;
  size: number;
  testID?: string;
}

export const normalizeProfileImageUri = (
  uri?: string | null,
): string | undefined => {
  if (typeof uri !== 'string') {
    return undefined;
  }

  const normalizedUri = uri.trim();
  return normalizedUri || undefined;
};

/**
 * Renders every user profile image with the same placeholder when its value is
 * missing or the remote image cannot be loaded.
 */
export const ProfileImage: React.FC<ProfileImageProps> = ({
  uri,
  size,
  testID,
}) => {
  const normalizedUri = normalizeProfileImageUri(uri);
  const imageUrl = normalizedUri ? getS3ImageUrl(normalizedUri) : null;
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {imageUrl && !hasImageError ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <ProfilePlaceholder width={size} height={size} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
