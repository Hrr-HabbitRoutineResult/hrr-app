import React from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import QuestionMarkCircleIcon from '../../../assets/icons/challenge-profile/question-mark-circle.svg';
import ResolvedCircleIcon from '../../../assets/icons/challenge-profile/resolved-circle.svg';
import TextIcon from '../../../assets/icons/text.svg';

export interface PhotoCertificationItem {
  id: number;      // 인증 아이템 고유 ID
  thumbnail: any;  // 썸네일 이미지
  isQuestion?: boolean; // 질문 여부
  isResolved?: boolean; // 채택 답변 존재 여부
}

interface PhotoCertificationGridProps {
  items: PhotoCertificationItem[];  // 인증 아이템 배열
  onItemPress?: (item: PhotoCertificationItem) => void;  // 아이템 클릭 이벤트 핸들러
  showOverlay?: boolean;  // 오버레이 표시 여부 (기본값: true)
  containerPadding?: number;  // 컨테이너 좌우 패딩 (기본값: 0)
}

// 공통 PhotoCertificationGrid 컴포넌트 (사진 인증 그리드)
export const PhotoCertificationGrid: React.FC<PhotoCertificationGridProps> = ({
  items,
  onItemPress,
  showOverlay = true,
  containerPadding = 0,
}) => {
  const screenWidth = Dimensions.get('window').width;
  // 그리드 아이템 너비 계산 (컨테이너 패딩 제외, gap 고려)
  const itemWidth = (screenWidth - containerPadding * 2 - scale(6) - 0.1) / 3;

  return (
    <View style={[styles.grid, { paddingHorizontal: containerPadding }]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.gridItem, { width: itemWidth, height: itemWidth }]}
          onPress={() => onItemPress?.(item)}
          activeOpacity={0.8}
        >
          {item.thumbnail && item.thumbnail.uri ? (
            <Image source={item.thumbnail} style={styles.gridImage} />
          ) : (
            <View style={styles.fallbackContainer}>
              <TextIcon width="100%" height="100%" />
            </View>
          )}
          {/* 질문 아이콘 표시 (showOverlay가 true이고 item이 질문일 때만) */}
          {showOverlay && item.isQuestion && (
            <View style={styles.questionMarkContainer}>
              {item.isResolved ? (
                <ResolvedCircleIcon width={24} height={24} />
              ) : (
                <QuestionMarkCircleIcon width={24} height={24} />
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(3),
  },
  gridItem: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0', // Fallback background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9E9E9', // A light grey background for the fallback
  },
  questionMarkContainer: {
    position: 'absolute',
    top: verticalScale(12),
    left: scale(12),
  },
});

