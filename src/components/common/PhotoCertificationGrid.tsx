import React from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import QuestionMarkCircleIcon from '../../../assets/icons/challenge-profile/question-mark-circle.svg';

export interface PhotoCertificationItem {
  id: number;      // 인증 아이템 고유 ID
  thumbnail: any;  // 썸네일 이미지
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
  const itemWidth = (screenWidth - containerPadding * 2 - scale(6)) / 3; // 화면 너비 - 컨테이너 패딩(좌우) - gap(3*2) / 3개

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.gridItem, { width: itemWidth, height: itemWidth }]}
          onPress={() => onItemPress?.(item)}
          activeOpacity={0.8}
        >
          <Image source={item.thumbnail} style={styles.gridImage} />
          <View style={styles.questionMarkContainer}>
            <QuestionMarkCircleIcon width={24} height={24} />
          </View>
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
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  questionMarkContainer: {
    position: 'absolute',
    top: verticalScale(12),
    left: scale(12),
  },
});

