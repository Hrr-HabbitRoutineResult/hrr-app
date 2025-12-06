import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
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

const screenWidth = Dimensions.get('window').width;
const iconSize = 24;

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
              {/* 탭 아이콘 */}
              <View>{renderTabIcon(route.name as keyof HomeTabParamList, isFocused)}</View>
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
