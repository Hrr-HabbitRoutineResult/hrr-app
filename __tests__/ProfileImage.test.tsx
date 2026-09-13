import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image } from 'react-native';
import {
  normalizeProfileImageUri,
  ProfileImage,
} from '../src/components/common/ProfileImage';

jest.mock('react-native', () => ({
  View: 'View',
  Image: 'Image',
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { S3_BUCKET_NAME: 'profile-test', S3_REGION: 'ap-northeast-2' },
}));
jest.mock('../assets/icons/ranking/profile-placeholder.svg', () => 'ProfilePlaceholder');

describe('ProfileImage', () => {
  it.each([null, undefined, '', '   '])(
    'uses the shared placeholder for a missing profile URI: %p',
    uri => {
      let screen!: Renderer.ReactTestRenderer;
      act(() => {
        screen = Renderer.create(<ProfileImage uri={uri} size={40} />);
      });

      expect(screen.root.findAllByType(Image)).toHaveLength(0);
      expect(screen.root.findAllByType('ProfilePlaceholder' as any)).toHaveLength(1);
    },
  );

  it('preserves a valid profile image and uses the shared placeholder after an error', () => {
    let screen!: Renderer.ReactTestRenderer;
    act(() => {
      screen = Renderer.create(
        <ProfileImage uri="profiles/user.png" size={40} />,
      );
    });

    const image = screen.root.findByType(Image);
    expect(image.props.source).toEqual({
      uri: 'https://profile-test.s3.ap-northeast-2.amazonaws.com/profiles/user.png',
    });

    act(() => {
      image.props.onError();
    });

    expect(screen.root.findAllByType(Image)).toHaveLength(0);
    expect(screen.root.findAllByType('ProfilePlaceholder' as any)).toHaveLength(1);
  });

  it('trims non-empty profile URIs before rendering', () => {
    expect(normalizeProfileImageUri('  profiles/user.png  ')).toBe(
      'profiles/user.png',
    );
  });
});
