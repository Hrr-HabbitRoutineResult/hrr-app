import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { colors } from '../../design/tokens';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const TOGGLE_WIDTH = 48;
const TOGGLE_HEIGHT = 24;
const CIRCLE_SIZE = 18;
const PADDING = 3;
const TRAVEL = TOGGLE_WIDTH - CIRCLE_SIZE - PADDING * 2;

const Toggle = ({ value, onValueChange, disabled = false }: ToggleProps) => {
  const translateX = useRef(new Animated.Value(value ? TRAVEL : 0)).current;
  const backgroundAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? TRAVEL : 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
    Animated.timing(backgroundAnim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.button, colors.primary.main],
  });

  return (
    <TouchableWithoutFeedback onPress={() => !disabled && onValueChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default Toggle;

const styles = StyleSheet.create({
  track: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: PADDING,
  },
  thumb: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.white,
  },
});
