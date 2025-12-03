import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';
import LinkIcon from '../../../assets/icons/challenge-profile/link.svg';
import QuestionMarkTextIcon from '../../../assets/icons/challenge-profile/question-mark-text.svg';

export interface TextCertificationItem {
  id: number;           // 인증 아이템 고유 ID
  title: string;        // 인증 글 제목
  description: string;  // 인증 글 내용
  date: string;         // 인증 날짜
  thumbnail: any;       // 썸네일 이미지
}

interface TextCertificationListProps {
  items: TextCertificationItem[];  // 인증 아이템 배열
  onItemPress?: (item: TextCertificationItem) => void;  // 아이템 클릭 이벤트 핸들러
  containerPadding?: number;  // 컨테이너 좌우 패딩 (기본값: 24)
}

// 공통 TextCertificationList 컴포넌트 (글 인증 리스트)
export const TextCertificationList: React.FC<TextCertificationListProps> = ({
  items,
  onItemPress,
  containerPadding = 24,
}) => {
  return (
    <View style={[styles.list, { paddingHorizontal: containerPadding }]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onItemPress?.(item)}
          activeOpacity={0.8}
        >
          <View style={styles.content}>
            <Text variant="smMd" color={colors.text.primary} style={styles.title}>
              {item.title}
            </Text>
            <Text variant="xxs" color={colors.text.tertiary} style={styles.description}>
              {item.description}
            </Text>
            <View style={styles.date}>
              <Text variant="xxs" color={colors.text.tertiary}>
                {item.date}
              </Text>
              <LinkIcon width={10} height={10} />
            </View>
          </View>
          <View style={styles.thumbnail}>
            <Image source={item.thumbnail} style={styles.thumbnailImage} />
            <View style={styles.thumbnailOverlay}>
              <QuestionMarkTextIcon width={30} height={36} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    height: 104,
    paddingVertical: 12,
    gap: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    lineHeight: 20,
  },
  description: {
    lineHeight: 18,
    marginTop: 5,
  },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

