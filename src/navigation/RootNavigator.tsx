// src/navigation/RootNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash'; // ← 추가

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import RandomMissionScreen from '../screens/RandomMissionScreen';

import { HomeTabParamList, RootStackParamList } from './types';
import BottomTabBarIcons from '../components/home/BottomTabBarIcons';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <BottomTabBarIcons routeName={route.name} focused={focused} />
      ),
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={HomeScreen} />
    <Tab.Screen name="Chat" component={HomeScreen} />
    <Tab.Screen name="My" component={HomeScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => (
  <NavigationContainer
    onReady={() => {
      // 네비가 준비되면 스플래시를 숨김
      RNBootSplash.hide({ fade: true });
    }}
  >
    <Stack.Navigator>
      <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChallengeList" component={ChallengeListScreen} />
      <Stack.Screen name="RandomMission" component={RandomMissionScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
