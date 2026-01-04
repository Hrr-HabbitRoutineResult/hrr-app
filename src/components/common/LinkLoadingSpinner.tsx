import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export const LinkLoadingSpinner: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * 0.4;

  return (
    <Animated.View style={[styles.container, { transform: [{ rotate: rotation }] }]}>
      <Svg width="36" height="36" viewBox="0 0 36 36">
        <Defs>
          {/* 그라데이션 정의 */}
          <LinearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF473B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FF9F99" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* 배경 원 */}
        <Circle
          cx="18"
          cy="18"
          r={radius}
          stroke="#FF9F99"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 진한 부분 */}
        <Circle
          cx="18"
          cy="18"
          r={radius}
          stroke="url(#spinnerGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
          fill="none"
          transform="rotate(-90 18 18)"
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
