import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { getErrorMessage } from '../utils/errorHandler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { colors } from '../design/tokens';
import { getBlockedUsers, unblockUserById, BlockedUser } from '../libs/api/user';
import BlockedUserListItem from '../components/user/BlockedUserListItem';
import { useUserStore } from '../store/userSlice';

const BlockedUserScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { userInfo } = useUserStore();
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBlockedUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await getBlockedUsers();
            setBlockedUsers(users);
        } catch (error) {
            const errorMessage = getErrorMessage(error, '차단된 사용자 목록을 불러오는데 실패했습니다.');
            Alert.alert('오류', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchBlockedUsers();
        }, [fetchBlockedUsers])
    );

    const handleUnblock = async (userId: number) => {
        try {
            await unblockUserById(userId);
            // After unblocking, refetch the list to update the UI
            fetchBlockedUsers();
        } catch (error) {
            const errorMessage = getErrorMessage(error, '차단 해제에 실패했습니다.');
            Alert.alert('오류', errorMessage);
        }
    };

    // 프로필 클릭 핸들러 -> 본인이면 My, 다른 유저면 User 화면으로 이동
    const handleProfilePress = (userId: number) => {
        if (userInfo?.userId === userId) {
            navigation.navigate('HomeTabs', { screen: '마이' });
        } else {
            navigation.navigate('User', { userId });
        }
    };

    return (
        <View style={styles.container}>
            <Header title="차단한 사용자" onBack={() => navigation.goBack()} useSafeArea />
            <FlatList
                data={blockedUsers}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleProfilePress(item.userId)}>
                        <BlockedUserListItem
                            nickname={item.nickname}
                            level={item.level}
                            onUnblock={() => handleUnblock(item.userId)}
                        // avatarUrl is not provided by the API for blocked users
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => String(item.userId)}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={fetchBlockedUsers}
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

export default BlockedUserScreen;
