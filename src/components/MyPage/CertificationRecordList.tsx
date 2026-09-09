import React from 'react';
import { getCertificationThumbnailSource } from '../../utils/certificationThumbnail';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../design/tokens';
import { scale, verticalScale } from '../../utils/scaling';
import { Text } from '../common/Text';
import ThumbnailDefaultIcon from '../../../assets/icons/challenge-profile/thumbnail_default.svg';
import PhotoTypeIcon from '../../../assets/icons/challenge-create/photo-unselected.svg';
import TextTypeIcon from '../../../assets/icons/challenge-create/text-unselected.svg';
import LinkIcon from '../../../assets/icons/challenge-profile/link.svg';

export interface CertificationRecordItem {
  id: number;
  title: string;
  challengeTitle: string;
  date: string;
  type: 'CAMERA' | 'TEXT';
  thumbnailUrl: string | null;
  originalPhotoUrl?: string | null;
  description?: string;
  metaIcon?: 'type' | 'link';
  hasLink?: boolean;
}

interface CertificationRecordListProps {
  items: CertificationRecordItem[];
  onItemPress?: (item: CertificationRecordItem) => void;
  variant?: 'default' | 'scrap';
}

const CertificationRecordList = ({
  items,
  onItemPress,
  variant = 'default',
}: CertificationRecordListProps) => (
  <View>
    {items.map((item) => {
      const thumbnail = getCertificationThumbnailSource(
        item.originalPhotoUrl,
        item.thumbnailUrl ? { uri: item.thumbnailUrl } : null,
      );
      return (
      <TouchableOpacity
        key={item.id}
        style={[styles.row, variant === 'scrap' && styles.scrapRow]}
        activeOpacity={0.8}
        onPress={() => onItemPress?.(item)}
      >
        <View style={styles.copy}>
          <Text variant="xsMd" color={colors.text.primary} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            variant="xxs"
            color={colors.text.tertiary}
            style={styles.challengeTitle}
            numberOfLines={1}
          >
            {item.description ?? item.challengeTitle}
          </Text>
          <View style={styles.metaRow}>
            <Text variant="caption" color={colors.icon.gray}>
              {item.date}
            </Text>
            {item.metaIcon === 'link' ? (
              item.hasLink ? <LinkIcon width={scale(10)} height={verticalScale(10)} /> : null
            ) : item.type === 'CAMERA' ? (
              <PhotoTypeIcon width={scale(11)} height={verticalScale(10)} />
            ) : (
              <TextTypeIcon width={scale(11)} height={verticalScale(9)} />
            )}
          </View>
        </View>

        <View style={[styles.thumbnail, variant === 'scrap' && styles.scrapThumbnail]}>
          {thumbnail ? (
            <Image source={thumbnail} style={styles.thumbnailImage} />
          ) : (
            <View style={styles.placeholder}>
              <ThumbnailDefaultIcon width={scale(40)} height={verticalScale(40)} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: verticalScale(104),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    paddingVertical: verticalScale(12),
  },
  scrapRow: {
    minHeight: verticalScale(100),
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    marginTop: verticalScale(3),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(10),
  },
  thumbnail: {
    width: scale(80),
    height: verticalScale(80),
    borderRadius: scale(10),
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  scrapThumbnail: {
    width: scale(76),
    height: verticalScale(76),
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default CertificationRecordList;
