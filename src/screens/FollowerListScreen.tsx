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

    const refetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (targetUserId) {
                const fetchedFollowers = await getFollowersByUserId(targetUserId);
                const fetchedFollowings = await getFollowingsByUserId(targetUserId);
                setOtherUserFollowers(fetchedFollowers);
                setOtherUserFollowings(fetchedFollowings);
            } else {
                await fetchFollowers();
                await fetchFollowings();
            }
        } catch (error) {
            // Error is handled in the calling function
        } finally {
            setIsLoading(false);
        }
    }, [targetUserId, fetchFollowers, fetchFollowings]);

    // Fetch data based on targetUserId or current user
    useEffect(() => {
        const fetchData = async () => {
            try {
                await refetchData();
            } catch {
                Alert.alert('오류', '팔로우 목록을 불러오는데 실패했습니다.');
            }
        };
        fetchData();
    }, [refetchData]);

    const handlePressFollow = async (item: FollowItem, event: any) => {
        if (item.isFollowing) {
            // For unfollow, show popover. Use measureInWindow for correct screen coordinates.
            const { currentTarget } = event;
            currentTarget.measureInWindow((x: number, y: number, width: number, height: number) => {
                setButtonLayout({ x, y, width, height });
                setSelectedItem(item);
                setPopoverVisible(true);
            });
        } else {
            // For follow, execute immediately.
            try {
                await followUser(item.id);
                await refetchData();
            } catch (error) {
                Alert.alert('오류', '팔로우에 실패했습니다.');
            }
        }
    };

    const handleConfirmAction = useCallback(async () => {
        if (!selectedItem) return;

        const { id, isFollowing } = selectedItem;
        // This action is now only for unfollowing
        if (isFollowing) {
            try {
                await unfollowUser(id);
                await refetchData();
            } catch (error) {
                Alert.alert('오류', '언팔로우에 실패했습니다.');
            }
        }

        setPopoverVisible(false);
        setSelectedItem(null);
    }, [selectedItem, unfollowUser, refetchData]);


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
                                top: buttonLayout.y + buttonLayout.height + spacing.xs,
                                left: buttonLayout.x - spacing.sm,
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
