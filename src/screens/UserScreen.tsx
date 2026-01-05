import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, Pressable, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { colors, typography, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { format } from '../libs/format';

import {
  OtherUser,
  VerificationHistoryItem,
  OngoingChallengeItem,
  getUserById,
  getVerificationHistoryById,
  getOngoingChallengesById,
  followUser,
  unfollowUser,
  blockUserById,
  unblockUserById,
  reportUserById,
  ReportReason,
} from '../libs/api/user';
import { Header } from '../components/common/Header';
import ProfileCard from '../components/MyPage/ProfileCard';
import ParticipatingChallengeSection, { ParticipatingChallengeItem } from '../components/MyPage/ParticipatingChallengeSection';
import ViewModeHeader from '../components/MyPage/ViewModeHeader';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import MoreIcon from '../../assets/icons/more.svg';
import { BlockUserBottomSheet } from '../components/user/BlockUserBottomSheet';
import { UnblockUserBottomSheet } from '../components/user/UnblockUserBottomSheet';
import { ToastNotification } from '../components/common/ToastNotification';
import { ReportUserBottomSheet } from '../components/MyPage/ReportUserBottomSheet';

const SHEET_ANIM_MS = 220;

type UserScreenRouteProp = RouteProp<RootStackParamList, 'User'>;

const UserScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<UserScreenRouteProp>();
  const { userId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<OtherUser | null>(null);
  const [ongoingChallenges, setOngoingChallenges] = useState<OngoingChallengeItem[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [certificationViewMode, setCertificationViewMode] = useState('grid');
  
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isBlockSheetVisible, setIsBlockSheetVisible] = useState(false);
  const [isUnblockSheetVisible, setIsUnblockSheetVisible] = useState(false);
  const [isReportSheetVisible, setIsReportSheetVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: SHEET_ANIM_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    console.log('sheetAnim value after start:', sheetAnim.__getValue());
  };

  const closeSheet = (callback?: () => void) => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: SHEET_ANIM_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSheetVisible(false);
        callback?.();
      }
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setIsFollowing(userData.isFollowing);
      setIsBlocked(userData.isBlocked);

      if (userData.isBlocked) {
        setOngoingChallenges([]);
        setVerificationHistory([]);
        return;
      }

      const challengesData = await getOngoingChallengesById(userId);
      setOngoingChallenges(challengesData.content);

      const historyData = await getVerificationHistoryById(userId);
      if (historyData.verifications) {
        setVerificationHistory(historyData.verifications.content);
      }
    } catch (error) {
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleFollowToggle = async () => {
    if (!user || isBlocked) return;
    try {
      if (isFollowing) {
        await unfollowUser(user.userId);
        setIsFollowing(false);
        setUser((prevUser) =>
          prevUser ? { ...prevUser, followerCount: prevUser.followerCount - 1 } : null
        );
      } else {
        await followUser(user.userId);
        setIsFollowing(true);
        setUser((prevUser) =>
          prevUser ? { ...prevUser, followerCount: prevUser.followerCount + 1 } : null
        );
      }
    } catch (error) {
      Alert.alert('오류', '팔로우 처리에 실패했습니다.');
    }
  };

  const handleBlock = () => {
    closeSheet(() => {
      setIsBlockSheetVisible(true);
    });
  };

  const handleConfirmBlock = async () => {
    if (!user) return;
    setIsBlockSheetVisible(false);
    try {
      await blockUserById(user.userId);
      await fetchData(); // 차단 후 데이터 새로고침
      setToast({ visible: true, message: '차단이 완료되었어요' });
    } catch (error) {
      Alert.alert('오류', '사용자 차단에 실패했습니다.');
    }
  };

  const handleUnblockPress = () => {
    setIsUnblockSheetVisible(true);
  };

  const handleConfirmUnblock = async () => {
    if (!user) return;
    setIsUnblockSheetVisible(false);
    try {
      await unblockUserById(user.userId);
      setToast({ visible: true, message: '차단 해제가 완료되었어요' });
      await fetchData(); // 차단 해제 후 데이터 새로고침
    } catch (error) {
      Alert.alert('오류', '사용자 차단 해제에 실패했습니다.');
    }
  };

  const handleReport = () => {
    closeSheet(() => {
        setIsReportSheetVisible(true);
    });
  };

  const handleReportSubmit = async (reason: string, detail: string) => {
    if (!user) return;
    try {
        await reportUserById({
            targetId: user.userId,
            reason: reason as ReportReason,
            description: detail,
        });
        setToast({ visible: true, message: '신고가 접수되었어요' });
    } catch (error) {
        Alert.alert('오류', '신고 접수에 실패했습니다.');
    }
  };

  const userProfile = useMemo(() => {
    if (!user) {
      return { nickname: '...', avatarUrl: '', followerCount: 0, followingCount: 0, isChallenger: false };
    }
    return {
      nickname: user.nickname,
      avatarUrl: user.profileImage,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      isChallenger: user.level !== 'BRONZE',
    };
  }, [user]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return (ongoingChallenges || []).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: `${item.currentRound}R째 진행 중`,
    }));
  }, [ongoingChallenges]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return (verificationHistory || []).map((item) => ({
      id: item.verificationId,
      title: `[${item.challengeTitle}] ${item.title}`,
      description: item.content || '',
      date: format.date(item.verifiedAt),
      thumbnail: { uri: item.photoUrl },
    }));
  }, [verificationHistory]);

  const renderTabContent = () => {
    if (isBlocked) {
      return (
        <View style={styles.emptyCertificationContainer}>
        </View>
      );
    }
    
    return (
      <View style={styles.tabContentListWrapper}>
        <ParticipatingChallengeSection
          items={participatingChallenges}
          onPressHeader={() => navigation.navigate('ParticipatingChallenge', { userId: userId })}
          onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
        />
        <ViewModeHeader
          title="인증 기록"
          initialMode={certificationViewMode}
          onViewModeChange={(mode) => setCertificationViewMode(mode)}
          onPressTitle={() => navigation.navigate('CertificationHistory', { userId: userId })}
        />
        {certificationItems.length === 0 ? (
          <View style={styles.emptyCertificationContainer}>
            <Text style={styles.tabContentText}>인증 기록이 없습니다</Text>
          </View>
        ) : certificationViewMode === 'grid' ? (
          <PhotoCertificationGrid
            items={certificationItems}
            showOverlay={false}
            onItemPress={(item) =>
              navigation.navigate('ChallengeCertificationDetail', {
                verificationId: item.id,
              })
            }
          />
        ) : (
          <TextCertificationList
            items={certificationItems}
            onItemPress={(item) =>
              navigation.navigate('ChallengeCertificationDetail', {
                verificationId: item.id,
              })
            }
          />
        )}
      </View>
    );
  };
  
  if (isLoading) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Header onBack={() => navigation.goBack()} title="프로필" />
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator />
            </View>
        </SafeAreaView>
    );
  }

  const backdropOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [240, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
        <Header
            onBack={() => navigation.goBack()}
            title="프로필"
            rightContent={
                <TouchableOpacity
                    onPress={openSheet}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <MoreIcon />
                </TouchableOpacity>
            }
        />
      <ScrollView style={styles.container}>
        <ProfileCard
          user={userProfile}
          variant='other'
          isFollowing={isFollowing}
          isBlocked={isBlocked}
          onPressFollow={handleFollowToggle}
          onPressBlock={handleUnblockPress}
          onPressFollowers={() => navigation.navigate('FollowerList', { initialTab: 'follower', userId: userId })}
          onPressFollowing={() => navigation.navigate('FollowerList', { initialTab: 'following', userId: userId })}
        />
        {renderTabContent()}
      </ScrollView>

      <Modal
        transparent
        visible={sheetVisible}
        animationType="none"
        onRequestClose={() => closeSheet()}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeSheet()}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </Pressable>

          <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
            <View style={styles.sheetGroup}>
              <Pressable style={styles.sheetItem} onPress={handleBlock}>
                <Text style={styles.sheetItemTextDestructive}>차단하기</Text>
              </Pressable>
              <View style={styles.sheetDivider} />
              <Pressable style={styles.sheetItem} onPress={handleReport}>
                <Text style={styles.sheetItemTextDestructive}>신고하기</Text>
              </Pressable>
            </View>
            <View style={{ height: 10 }} />
            <Pressable style={styles.sheetCancel} onPress={() => closeSheet()}>
              <Text style={styles.sheetItemText}>취소</Text>
            </Pressable>
            <View style={{ height: Platform.OS === 'ios' ? 10 : 16 }} />
          </Animated.View>
        </View>
      </Modal>

      <BlockUserBottomSheet
        visible={isBlockSheetVisible}
        onClose={() => setIsBlockSheetVisible(false)}
        onConfirm={handleConfirmBlock}
        username={user?.nickname}
      />
      <UnblockUserBottomSheet
        visible={isUnblockSheetVisible}
        onClose={() => setIsUnblockSheetVisible(false)}
        onConfirm={handleConfirmUnblock}
        username={user?.nickname}
      />
      <ReportUserBottomSheet
        visible={isReportSheetVisible}
        onClose={() => setIsReportSheetVisible(false)}
        onSubmit={handleReportSubmit}
      />
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tabContentListWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
  },
  tabContentText: {
    ...typography.md,
    color: colors.text.secondary,
  },
  emptyCertificationContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  // Sheet styles
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheetWrap: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  sheetGroup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sheetItem: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  sheetItemTextDestructive: {
    fontSize: 16,
    color: colors.destructive.Android,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.background,
  },
  sheetCancel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});