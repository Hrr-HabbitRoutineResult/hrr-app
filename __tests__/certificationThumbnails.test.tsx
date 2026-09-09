import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import CertificationRecordList from '../src/components/MyPage/CertificationRecordList';
import { TextCertificationList } from '../src/components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../src/components/common/PhotoCertificationGrid';

jest.mock('react-native', () => ({
  Image: 'Image', TouchableOpacity: 'TouchableOpacity', View: 'View',
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('../src/components/common/Text', () => ({ Text: 'Text' }));
jest.mock('../assets/icons/challenge-profile/thumbnail_default.svg', () => 'Placeholder');
jest.mock('../assets/icons/challenge-create/photo-unselected.svg', () => 'PhotoType');
jest.mock('../assets/icons/challenge-create/text-unselected.svg', () => 'TextType');
jest.mock('../assets/icons/challenge-profile/link.svg', () => 'Link');
jest.mock('../assets/icons/challenge-profile/question-mark-text.svg', () => 'Question');
jest.mock('../assets/icons/challenge-profile/resolved-text.svg', () => 'Resolved');
jest.mock('../assets/icons/challenge-profile/question-mark-circle.svg', () => 'Question');
jest.mock('../assets/icons/challenge-profile/resolved-circle.svg', () => 'Resolved');
jest.mock('../assets/icons/text.svg', () => 'Placeholder');

const stamped = 'https://example.test/stamped.jpg';
const original = 'https://example.test/original.jpg';
const base = { id: 42, title: '인증', challengeTitle: '챌린지', description: '내용',
  date: '2026.09.09', type: 'CAMERA' as const, thumbnailUrl: stamped,
  thumbnail: { uri: stamped }, isQuestion: true };

it.each([CertificationRecordList, TextCertificationList, PhotoCertificationGrid])(
  '%p prefers the original, falls back for legacy records, and preserves navigation', async Component => {
    const onItemPress = jest.fn();
    const items = [
      { ...base, originalPhotoUrl: original },
      { ...base, id: 43, originalPhotoUrl: null },
      { ...base, id: 44 },
      { ...base, id: 45, originalPhotoUrl: '' },
    ];
    let screen!: Renderer.ReactTestRenderer;
    await act(async () => { screen = Renderer.create(<Component items={items} onItemPress={onItemPress} />); });
    expect(screen.root.findAllByType('Image' as any).map(img => img.props.source.uri))
      .toEqual([original, stamped, stamped, stamped]);
    screen.root.findAllByType('TouchableOpacity' as any)[0].props.onPress();
    expect(onItemPress).toHaveBeenCalledWith(items[0]);
    await act(async () => screen.unmount());
  },
);

it.each([CertificationRecordList, TextCertificationList, PhotoCertificationGrid])(
  '%p preserves placeholders when neither image is present', async Component => {
    let screen!: Renderer.ReactTestRenderer;
    await act(async () => { screen = Renderer.create(<Component items={[
      { ...base, thumbnailUrl: null, thumbnail: null, originalPhotoUrl: null },
    ]} />); });
    expect(screen.root.findAllByType('Image' as any)).toHaveLength(0);
    expect(screen.root.findAllByType('Placeholder' as any)).toHaveLength(1);
    await act(async () => screen.unmount());
  },
);
