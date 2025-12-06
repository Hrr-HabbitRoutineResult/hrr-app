import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RNBootSplash from 'react-native-bootsplash'; // ← 추가

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import RandomMissionScreen from '../screens/RandomMissionScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import MyScreen from '../screens/MyScreen';
import { ChallengeProfileScreen } from '../screens/ChallengeProfile/ChallengeProfileScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

import { HomeTabParamList, RootStackParamList } from './types';
import CustomTabBar from '../components/common/CustomTabBar';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const OnboardingScreenWrapper = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  return (
    <OnboardingScreen
      onComplete={() => {
        navigation.goBack();
      }}
    />
  );
};

const HomeTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarLabelStyle: { display: 'none' }, // Hide default labels
    }}
  >
    <Tab.Screen name="홈" component={HomeScreen} />
    <Tab.Screen name="검색" component={SearchScreen} />
    <Tab.Screen name="채팅" component={ChatScreen} />
    <Tab.Screen name="마이" component={MyScreen} />
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
      <Stack.Screen name="ChallengeProfile" component={ChallengeProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreenWrapper} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
