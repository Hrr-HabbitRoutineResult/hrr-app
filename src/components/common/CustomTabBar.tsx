import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../../design/tokens';
import { HomeTabParamList } from '../../navigation/types';

// Import SVG icons
import HomeIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_home_color.svg';
import HomeIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_home.svg';
import SearchIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_search_color.svg';
import SearchIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_search.svg';
import ChatIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_chat_color.svg';
import ChatIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_chat.svg';
import MyIconColor from '../../../assets/icons/homescreen/bottomtapbar/ic_my_color.svg';
import MyIcon from '../../../assets/icons/homescreen/bottomtapbar/ic_my.svg';

const iconSize = scale(24);

/**
 * 탭 이름과 포커스 상태에 따라 아이콘 반환
 */
const renderTabIcon = (routeName: keyof HomeTabParamList, focused: boolean) => {
  switch (routeName) {
    case '홈':
      return focused ? (
        <HomeIconColor width={iconSize} height={iconSize} />
      ) : (
        <HomeIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
      );
    case '검색':
      return focused ? (
        <SearchIconColor width={iconSize} height={iconSize} />
      ) : (
        <SearchIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
      );
    case '채팅':
      return focused ? (
        <ChatIconColor width={iconSize} height={iconSize} />
      ) : (
        <ChatIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
      );
    case '마이':
      return focused ? (
        <MyIconColor width={iconSize} height={iconSize} />
      ) : (
        <MyIcon width={iconSize} height={iconSize} color={colors.icon.gray} />
      );
    default:
      return null;
  }
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={styles.iconLabelContainer}>
              <View>{renderTabIcon(route.name as keyof HomeTabParamList, isFocused)}</View>
              <View style={styles.labelContainer}>
                <Text style={{
                  color: isFocused ? colors.text.primary : colors.text.secondary,
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
    justifyContent: 'space-around', // Distribute items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: colors.white,
    height: verticalScale(84),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: scale(1),
    borderTopColor: colors.line,
    paddingHorizontal: scale(10), // Add some horizontal padding
  },
  tabItem: {
    flex: 1, // Each item takes equal space
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  iconLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    marginTop: verticalScale(5),
  }
});

export default CustomTabBar;