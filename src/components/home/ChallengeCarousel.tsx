import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { Challenge } from '../../store/challengeSlice';
import { tokens } from '../../design/tokens';
import Pagination from '../homescreen/Pagination';

const { width: screenWidth } = Dimensions.get('window');
const ACTIVE_ITEM_SIZE = 200;
const INACTIVE_ITEM_SIZE = 160;
const ITEM_WIDTH = ACTIVE_ITEM_SIZE;
const SPACING = (screenWidth - ITEM_WIDTH) / 2;

type ChallengeCarouselProps = {
  challenges: Challenge[];
};

const ChallengeCarousel = ({ challenges }: ChallengeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    if (isPaused || challenges.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % challenges.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, challenges.length]);

  const handlePressIn = () => setIsPaused(true);
  const handlePressOut = () => setIsPaused(false);

  const renderItem = ({ item, index }: { item: Challenge, index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [INACTIVE_ITEM_SIZE / ACTIVE_ITEM_SIZE, 1, INACTIVE_ITEM_SIZE / ACTIVE_ITEM_SIZE],
      extrapolate: 'clamp',
    });

    return (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={styles.itemContainer}>
                <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    <View style={styles.overlay}>
                        <Text style={styles.challengeName}>{item.title}</Text>
                        {item.todayEligible && <View style={styles.checkBadge} />}
                    </View>
                </Animated.View>
            </View>
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
        keyExtractor={(item) => item.id}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        ListHeaderComponent={<View style={{ width: SPACING }} />}
        ListFooterComponent={<View style={{ width: SPACING }} />}
        contentContainerStyle={{ alignItems: 'center' }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true, listener: (event) => setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH)) }
        )}
        scrollEventThrottle={16}
      />
      <Pagination total={challenges.length} current={currentIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        height: ACTIVE_ITEM_SIZE + 20,
    },
    itemContainer: {
        width: ITEM_WIDTH,
    },
    item: {
        width: ACTIVE_ITEM_SIZE,
        height: ACTIVE_ITEM_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: ACTIVE_ITEM_SIZE / 2,
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