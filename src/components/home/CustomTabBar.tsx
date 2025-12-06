import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import BottomTabBarIcons from './BottomTabBarIcons';
import { colors, typography } from '../../design/tokens';

const screenWidth = Dimensions.get('window').width;

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const containerSize = 48;
  const itemSpacing = 32;
  const initialLeftMargin = 51;
  const topMargin = 4;

  const getLeftPosition = (index: number) => {
    return initialLeftMargin + index * (containerSize + itemSpacing);
  };

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        // 사용되지 않아 주석 처리
        // const tabBarOptions = options as any;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        
        // 기존 라벨 로직 주석 처리
        // 항상 route.name을 사용하므로 불필요한 분기 처리 제거
        // const label =
        //   options.tabBarLabel !== undefined
        //     ? options.tabBarLabel
        //     : options.title !== undefined
        //     ? options.title
        //     : route.name;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            // testID={tabBarOptions.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { left: getLeftPosition(index) }]}
          >
            {/* 아이콘+글자 컨테이너 */}
            <View style={styles.iconLabelContainer}>
              <BottomTabBarIcons routeName={route.name as any} focused={isFocused} />
              {/* 탭 이름 라벨 */}
              <View style={styles.labelContainer}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.xxs.fontSize,
                  fontFamily: typography.xxs.fontFamily,
                }}>
                  {route.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 84,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tabItem: {
    position: 'absolute',
    top: 4,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabelContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4.5,
  },
  labelContainer: {
    marginTop: 5,
  }
});

export default CustomTabBar;
