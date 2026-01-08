import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { TabBar, TabItem } from '../components/common/TabBar';
import PersonListItem from '../components/common/PersonListItem';
import { colors, radius, spacing } from '../design/tokens';
import { useUserStore } from '../store/userSlice';
import { FollowItem, getFollowersByUserId, getFollowingsByUserId } from '../libs/api/user';
import { Text } from '../components/common/Text';

type FollowerListScreenRouteProp = RouteProp<RootStackParamList, 'FollowerList'>;

const FollowerListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<FollowerListScreenRouteProp>();
    const { initialTab, userId: targetUserId } = route.params;

    const [activeTab, setActiveTab] = useState(initialTab);
    const {
      followers,
      followings,
      fetchFollowers,
      fetchFollowings,
      followUser,
      unfollowUser,
      userInfo, // Get current user info from the store
    } = useUserStore();

    // State for other user's follow lists
    const [otherUserFollowers, setOtherUserFollowers] = useState<FollowItem[]>([]);
    const [otherUserFollowings, setOtherUserFollowings] = useState<FollowItem[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Add a loading state

    // Popover state
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [selectedItem, setSelectedItem] = useState<FollowItem | null>(null);

    // Fetch data based on targetUserId or current user
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (targetUserId) {
                try {
                    const fetchedFollowers = await getFollowersByUserId(targetUserId);
                    const fetchedFollowings = await getFollowingsByUserId(targetUserId);
                    setOtherUserFollowers(fetchedFollowers);
                    setOtherUserFollowings(fetchedFollowings);
                } catch (error) {
                    Alert.alert('오류', '팔로우 목록을 불러오는데 실패했습니다.');
                }
            } else {
                fetchFollowers();
                fetchFollowings();
            }
            setIsLoading(false);
        };
        fetchData();
    }, [targetUserId, fetchFollowers, fetchFollowings]);

    const handlePressFollow = (item: FollowItem, event: any) => {
        const { currentTarget } = event;
        currentTarget.measure((_fx: number, _fy: number, width: number, height: number, px: number, py: number) => {
            setButtonLayout({ x: px, y: py, width, height });
            setSelectedItem(item);
            setPopoverVisible(true);
        });
    };

    const handleConfirmAction = useCallback(async () => {
        if (!selectedItem) return;

        const { id, isFollowing } = selectedItem;
        try {
            if (isFollowing) {
                await unfollowUser(id);
            } else {
                await followUser(id);
            }
            // Re-fetch lists after action
            if (targetUserId) {
                // If viewing another user's list, re-fetch that user's list
                const fetchedFollowers = await getFollowersByUserId(targetUserId);
                const fetchedFollowings = await getFollowingsByUserId(targetUserId);
                setOtherUserFollowers(fetchedFollowers);
                setOtherUserFollowings(fetchedFollowings);
            } else {
                // If viewing current user's list, use store actions to re-fetch
                fetchFollowers();
                fetchFollowings();
            }
        } catch (error) {
            Alert.alert('오류', '작업에 실패했습니다.');
        } finally {
            setPopoverVisible(false);
            setSelectedItem(null);
        }
    }, [selectedItem, targetUserId, followUser, unfollowUser, fetchFollowers, fetchFollowings]);


    const tabs: TabItem[] = [
        { key: 'follower', label: '팔로워' },
        { key: 'following', label: '팔로잉' },
    ];

    const data = targetUserId
        ? (activeTab === 'follower' ? otherUserFollowers : otherUserFollowings)
        : (activeTab === 'follower' ? followers : followings);

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="팔로우" onBack={() => navigation.goBack()} useSafeArea showDivider={true} />
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
                      onPressFollow={(event) => handlePressFollow(item, event)}
                      showFollowButton={item.id !== userInfo?.userId}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
            />
             <Modal visible={popoverVisible} transparent onRequestClose={() => setPopoverVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setPopoverVisible(false)}>
                    <View
                        style={[
                            styles.popover,
                            {
                                top: buttonLayout.y - spacing.sm,
                                left: buttonLayout.x - (buttonLayout.width * 0.2), // Adjust left to align right edges
                                width: buttonLayout.width * 1.2, // 80% of 1.5 times, which is 1.2 times original button width
                            },
                        ]}
                    >
                        <TouchableOpacity onPress={handleConfirmAction} style={styles.popoverButton}>
                            <Text variant="sm" color={selectedItem?.isFollowing ? colors.text.error : colors.text.primary}>
                                {selectedItem?.isFollowing ? '언팔로우하기' : '팔로우하기'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
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
    modalOverlay: {
        flex: 1,
    },
    popover: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: radius.sm,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    popoverButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
});

export default FollowerListScreen;
