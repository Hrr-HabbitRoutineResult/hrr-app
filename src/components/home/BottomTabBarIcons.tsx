import React from 'react';
import { Text } from 'react-native';
import { HomeTabParamList } from '../../navigation/types';

type Props = {
  routeName: keyof HomeTabParamList;
  focused: boolean;
};

const BottomTabBarIcons = ({ routeName, focused }: Props) => {
  // This is a placeholder. In a real app, you would use icons.
  const iconName = routeName;
  return <Text style={{ color: focused ? 'blue' : 'gray' }}>{iconName}</Text>;
};

export default BottomTabBarIcons;
