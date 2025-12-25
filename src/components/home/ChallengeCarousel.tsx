import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { Challenge, trackChallengeClick } from '../../libs/api/challenge';
import { colors, typography, spacing } from '../../design/tokens';
import { CarouselPagination } from '../common/CarouselPagination';
import { RootStackParamList } from '../../navigation/types';
import PlusIcon from '../../../assets/icons/plus.svg';
import CheckboxChecked from '../../../assets/icons/checkbox-checked.svg';
import CheckboxUnchecked from '../../../assets/icons/checkbox-unchecked.svg';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_SIZE = scale(200);
const SPACING = scale(20);
const SNAP_INTERVAL = ITEM_SIZE + SPACING;

type ChallengeCarouselProps = {
  challenges: Challenge[];
};

const ChallengeCarousel = ({ challenges }: ChallengeCarouselProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any>>(null);

  // ✅ scrollX 기반 인덱스 계산
  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const index = Math.round(value / SNAP_INTERVAL);
      if (index !== currentIndex) setCurrentIndex(index);
    });
    return () => scrollX.removeListener(listenerId);
  }, [currentIndex]);

  const renderItem = ({ item, index }: { item: Challenge; index: number }) => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          trackChallengeClick(item.id);
          navigation.navigate('ChallengeProfile', { challengeId: item.id });
        }}
      >
        <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)']}
            style={styles.gradientOverlay}
          />
          <View style={styles.overlay}>
            <View style={styles.challengeInfo}>
              {item.todayEligible ? (
                <CheckboxChecked width={12} height={10} />
              ) : (
                <CheckboxUnchecked width={12} height={10} />
              )}
              <Text style={styles.challengeName}>{item.title}</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // 빈 상태일 때
  if (challenges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircle}>
          <View style={styles.contentWrapper}>
            <PlusIcon width={20} height={20} />
            <Text style={styles.emptyText}>
              새로운 챌린지에{'\n'}가입해 보세요
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={challenges}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        // ✅ 핵심: 양쪽 padding 모두 줘야 마지막 인덱스도 중앙에 옴
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - ITEM_SIZE) / 2,
        }}
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationWrapper}>
        <CarouselPagination currentIndex={currentIndex} totalItems={challenges.length} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(19),
  },
  paginationWrapper: {
    marginTop: verticalScale(12),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  emptyCircle: {
    width: scale(200),
    height: verticalScale(200),
    borderRadius: scale(100),
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.xsReg,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: verticalScale(20),
    lineHeight: verticalScale(18),
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: ITEM_SIZE / 2,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: ITEM_SIZE / 2,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(36),
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeName: {
    ...typography.xsMd,
    color: colors.white,
    marginLeft: scale(10),
  },
});

export default ChallengeCarousel;
