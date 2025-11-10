import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Challenge } from '../../store/challengeSlice';
import { tokens } from '../../design/tokens';
import Pagination from '../homescreen/Pagination';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_SIZE = 200;
const SPACING = 20;
const SNAP_INTERVAL = ITEM_SIZE + SPACING;

type ChallengeCarouselProps = {
  challenges: Challenge[];
};

const ChallengeCarousel = ({ challenges }: ChallengeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

  // ✅ 자동 슬라이드
  useEffect(() => {
    if (challenges.length === 0) return;
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % challenges.length;
        const offset = nextIndex * SNAP_INTERVAL;

        flatListRef.current?.scrollToOffset({
          offset,
          animated: true,
        });
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentIndex, isPaused, challenges.length]);

  const handlePressIn = () => setIsPaused(true);
  const handlePressOut = () => setIsPaused(false);

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
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.overlay}>
            <Text style={styles.challengeName}>{item.title}</Text>
            {item.todayEligible && <View style={styles.checkBadge} />}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

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
      <Pagination total={challenges.length} current={currentIndex + 1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_SIZE + 40,
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
  overlay: {
    position: 'absolute',
    bottom: tokens.spacing.md,
    left: tokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeName: {
    ...tokens.typography.header4,
    color: tokens.color.white,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.primary.main,
    marginLeft: tokens.spacing.xs,
  },
});

export default ChallengeCarousel;
