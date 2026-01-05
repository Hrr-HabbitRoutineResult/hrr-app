import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { TabBar, TabItem } from '../components/common/TabBar';
import PersonListItem from '../components/common/PersonListItem';
import { colors } from '../design/tokens';
import { useUserStore } from '../store/userSlice';

type FollowerListScreenRouteProp = RouteProp<RootStackParamList, 'FollowerList'>;

const FollowerListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<FollowerListScreenRouteProp>();
    const initialTab = route.params?.initialTab || 'follower';

    const [activeTab, setActiveTab] = useState(initialTab);
    const {
      followers,
      followings,
      fetchFollowers,
      fetchFollowings,
      followUser,
      unfollowUser,
    } = useUserStore();

    useEffect(() => {
      // Fetch both lists on mount
      fetchFollowers();
      fetchFollowings();
    }, [fetchFollowers, fetchFollowings]);

    const handleFollowToggle = useCallback(async (userId: number, isFollowing: boolean) => {
      try {
        if (isFollowing) {
          await unfollowUser(userId);
        } else {
          await followUser(userId);
        }
        // The store action will automatically re-fetch the lists
      } catch (error) {
        Alert.alert('오류', '작업에 실패했습니다.');
      }
    }, [unfollowUser, followUser]);

    const tabs: TabItem[] = [
        { key: 'follower', label: '팔로워' },
        { key: 'following', label: '팔로잉' },
    ];

    const data = activeTab === 'follower' ? followers : followings;

    return (
        <View style={styles.container}>
            <Header title="팔로우" onBack={() => navigation.goBack()} useSafeArea />
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <FlatList
                data={data}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => navigation.navigate('User', { userId: item.id })}>
                    <PersonListItem
                      avatarUrl={item.profilePhoto}
                      nickname={item.nickname}
                      tier={item.level}
                      isFollowing={item.isFollowing}
                      onPressFollow={() => handleFollowToggle(item.id, item.isFollowing)}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    listContent: {
        paddingHorizontal: 16,
    },
});

export default FollowerListScreen;
