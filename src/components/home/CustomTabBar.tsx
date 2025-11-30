import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import BottomTabBarIcons from './BottomTabBarIcons';
import { colors, typography } from '../../design/tokens';

const screenWidth = Dimensions.get('window').width;

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const tabWidth = 80; // Calculated from the user's provided spacing (e.g., 131 - 51 = 80)
  const initialLeftMargin = 51;

  const getLeftPosition = (index: number) => {
    return initialLeftMargin + index * tabWidth;
  };

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

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { left: getLeftPosition(index), width: tabWidth }]}
          >
            <BottomTabBarIcons routeName={route.name as any} focused={isFocused} />
            {typeof label === 'string' ? (
              <View style={styles.labelContainer}>
                <Text style={{
                  color: isFocused ? colors.primary.main : colors.icon.gray,
                  fontSize: typography.xxs.fontSize,
                  fontFamily: typography.xxs.fontFamily,
                }}>
                  {label}
                </Text>
              </View>
            ) : (
              label({ focused: isFocused, color: isFocused ? colors.primary.main : colors.icon.gray, position: 'below-icon' })
            )}
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
    height: 60, // Adjust height as needed
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tabItem: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    marginTop: 4, // Space between icon and label
  }
});

export default CustomTabBar;
