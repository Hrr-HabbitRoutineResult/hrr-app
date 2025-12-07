import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash'; // ← 추가

import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import RandomMissionScreen from '../screens/RandomMissionScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatScreen from '../screens/ChatScreen';
import MyScreen from '../screens/MyScreen';
import { ChallengeProfileScreen } from '../screens/ChallengeProfile/ChallengeProfileScreen';
import PopularChallengeScreen from '../screens/PopularChallengeScreen';
import { CreateChallengeQ1 } from '../screens/CreateChallenge/CreateChallengeQ1';
import { CreateChallengeQ2 } from '../screens/CreateChallenge/CreateChallengeQ2';
import { CreateChallengeQ3 } from '../screens/CreateChallenge/CreateChallengeQ3';
import { CreateChallengeQ4 } from '../screens/CreateChallenge/CreateChallengeQ4';
import { CreateChallengeProvider } from '../contexts/CreateChallengeContext';

import { HomeTabParamList, RootStackParamList } from './types';
import CustomTabBar from '../components/common/CustomTabBar';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

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
  <CreateChallengeProvider>
    <NavigationContainer
      onReady={() => {
        // 네비가 준비되면 스플래시를 숨김
        RNBootSplash.hide({ fade: true });
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ChallengeList" component={ChallengeListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RandomMission" component={RandomMissionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChallengeProfile" component={ChallengeProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PopularChallenge" component={PopularChallengeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ1" component={CreateChallengeQ1} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ2" component={CreateChallengeQ2} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ3" component={CreateChallengeQ3} options={{ headerShown: false }} />
        <Stack.Screen name="CreateChallengeQ4" component={CreateChallengeQ4} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  </CreateChallengeProvider>
);

export default RootNavigator;
