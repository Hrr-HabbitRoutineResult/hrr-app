import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { TabBar, TabItem } from '../components/common/TabBar';
import PersonListItem from '../components/common/PersonListItem';
import { colors } from '../design/tokens';

type FollowerListScreenRouteProp = RouteProp<RootStackParamList, 'FollowerList'>;

const FollowerListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<FollowerListScreenRouteProp>();
    const initialTab = route.params?.initialTab || 'follower';

    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs: TabItem[] = [
        { key: 'follower', label: '팔로워' },
        { key: 'following', label: '팔로잉' },
    ];

    const followers = [
        { id: '1', nickname: '팔로워1', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', isFollowing: true, tier: '브론즈' },
        { id: '2', nickname: '팔로워2', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', isFollowing: false, tier: '실버' },
    ];

    const following = [
        { id: '3', nickname: '팔로잉1', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', isFollowing: true, tier: '골드' },
    ];

    const data = activeTab === 'follower' ? followers : following;

    return (
        <View style={styles.container}>
            <Header title="팔로우" onBack={() => navigation.goBack()} useSafeArea />
            <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <FlatList
                data={data}
                renderItem={({ item }) => <PersonListItem {...item} />}
                keyExtractor={(item) => item.id}
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
