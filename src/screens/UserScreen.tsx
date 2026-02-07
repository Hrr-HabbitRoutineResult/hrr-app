import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text } from '../components/common/Text';
import { colors, typography, spacing } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { format } from '../libs/format';
import { scale, verticalScale } from '../utils/scaling';
import { getErrorMessage } from '../utils/errorHandler';

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
} from '../libs/api/user';
import { ReportReason } from '../libs/api/challenge';
import { Level, mapLevelStringToEnum } from '../libs/api/user/types';
import { Header } from '../components/common/Header';
import ProfileCard from '../components/MyPage/ProfileCard';
import ParticipatingChallengeSection, { ParticipatingChallengeItem } from '../components/MyPage/ParticipatingChallengeSection';
import ViewModeHeader, { ViewMode } from '../components/MyPage/ViewModeHeader';
import { TextCertificationList, TextCertificationItem } from '../components/common/TextCertificationList';
import { PhotoCertificationGrid } from '../components/common/PhotoCertificationGrid';
import MoreIcon from '../../assets/icons/more.svg';
import { BlockUserBottomSheet } from '../components/user/BlockUserBottomSheet';
import { UnblockUserBottomSheet } from '../components/user/UnblockUserBottomSheet';
import { ToastNotification } from '../components/common/ToastNotification';
import { ReportBottomSheet } from '../components/common/ReportBottomSheet';
import { ActionSheet, ActionSheetItem } from '../components/common/ActionSheet';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

type UserScreenRouteProp = RouteProp<RootStackParamList, 'User'>;

type UserInfo = Omit<OtherUser, 'level'> & {
  level: Level;
};

const UserScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<UserScreenRouteProp>();
  const { userId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ongoingChallenges, setOngoingChallenges] = useState<OngoingChallengeItem[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [certificationViewMode, setCertificationViewMode] = useState<ViewMode>('grid');

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [isBlockSheetVisible, setIsBlockSheetVisible] = useState(false);
  const [isUnblockSheetVisible, setIsUnblockSheetVisible] = useState(false);
  const [isReportSheetVisible, setIsReportSheetVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await getUserById(userId);
      const transformedUser: UserInfo = {
        ...userData,
        level: mapLevelStringToEnum(userData.level),
      };
      setUser(transformedUser);
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
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setToast({ visible: true, message: '오류가 발생했습니다.' });
        navigation.replace('ErrorScreen');
      } else {
        const errorMessage = getErrorMessage(error, '사용자 정보를 불러오는데 실패했습니다.');
        Alert.alert('오류', errorMessage);
        navigation.goBack();
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigation, setToast]);

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
      const errorMessage = getErrorMessage(error, '팔로우 처리에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  const handleBlock = () => {
    setIsBlockSheetVisible(true);
  };

  const handleConfirmBlock = async () => {
    if (!user) return;
    setIsBlockSheetVisible(false);
    try {
      await blockUserById(user.userId);
      await fetchData();
      setToast({ visible: true, message: '차단이 완료되었어요' });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '사용자 차단에 실패했습니다.');
      Alert.alert('오류', errorMessage);
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
      await fetchData();
    } catch (error) {
      const errorMessage = getErrorMessage(error, '사용자 차단 해제에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  const handleReport = () => {
    setIsReportSheetVisible(true);
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!user) return;
    try {
      await reportUserById({
        targetId: user.userId,
        reason: reason as any,
        description: description,
      });
      setIsReportSheetVisible(false);
      Alert.alert('신고 완료', '신고가 접수되었습니다.');
    } catch (error) {
      const errorMessage = getErrorMessage(error, '신고 접수에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  const userProfile = useMemo(() => {
    if (!user) {
      return { nickname: '...', avatarUrl: '', followerCount: 0, followingCount: 0, level: Level.BRONZE };
    }
    return {
      nickname: user.nickname,
      avatarUrl: user.profileImage,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      level: user.level,
    };
  }, [user]);

  const participatingChallenges: ParticipatingChallengeItem[] = useMemo(() => {
    return (ongoingChallenges || []).map((item) => ({
      id: String(item.challengeId),
      title: item.title,
      subtitle: item.description,
      imageUrl: item.image,
      roundText: item.isStarted
        ? `${item.currentRound}R째 진행 중`
        : `D-${item.dday}`,
    }));
  }, [ongoingChallenges]);

  const certificationItems: TextCertificationItem[] = useMemo(() => {
    return (verificationHistory || []).map((item) => {
      const thumbnailUrl = item.photoUrl ||
        (item.type === 'TEXT' && item.textImages && item.textImages.length > 0
          ? item.textImages[0]
          : null);

      return {
        id: item.verificationId,
        title: item.title,
        description: item.content || '',
        date: format.date(item.verifiedAt),
        thumbnail: thumbnailUrl ? { uri: thumbnailUrl } : null,
      };
    });
  }, [verificationHistory]);

  const renderTabContent = () => {
    if (isBlocked) {
      return (
        <View style={styles.emptyCertificationContainer}>
        </View>
      );
    }

    return (
      <>
        <View style={styles.participatingChallengeWrapper}>
          <ParticipatingChallengeSection
            items={participatingChallenges}
            onPressHeader={() => navigation.navigate('ParticipatingChallenge', { userId: userId })}
            onPressItem={(item) => navigation.navigate('ChallengeProfile', { challengeId: Number(item.id) })}
          />
        </View>

        <View style={styles.tabContentListWrapper}>
          <ViewModeHeader
            title="인증 기록"
            initialMode={certificationViewMode}
            onViewModeChange={(mode) => setCertificationViewMode(mode)}
            onPressTitle={() => navigation.navigate('CertificationHistory', { userId: userId })}
          />
          {certificationItems.length === 0 ? (
            <View style={styles.emptyCertificationContainer}>
              <Text variant="xsReg" color={colors.text.tertiary}>아직 인증 기록이 없습니다</Text>
            </View>
          ) : certificationViewMode === 'grid' ? (
            <View style={styles.photoGridContainer}>
              <PhotoCertificationGrid
                items={certificationItems}
                showOverlay={false}
                containerPadding={0}
                onItemPress={(item) =>
                  navigation.navigate('ChallengeCertificationDetail', {
                    verificationId: item.id,
                  })
                }
              />
            </View>
          ) : (
            <TextCertificationList
              items={certificationItems}
              containerPadding={0}
              onItemPress={(item) =>
                navigation.navigate('ChallengeCertificationDetail', {
                  verificationId: item.id,
                })
              }
            />
          )}
        </View>
      </>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header onBack={() => navigation.goBack()} title="프로필" showDivider />
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const actionSheetItems: ActionSheetItem[] = [
    {
      label: '차단하기',
      onPress: handleBlock,
      destructive: true,
    },
    {
      label: '신고하기',
      onPress: handleReport,
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onBack={() => navigation.goBack()}
        title="프로필"
        showDivider
        rightContent={
          <TouchableOpacity
            onPress={() => setActionSheetVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MoreIcon />
          </TouchableOpacity>
        }
      />
      <RefreshableScrollView
        style={styles.container}
        onRefresh={fetchData}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
        }}
      >
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
      </RefreshableScrollView>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        items={actionSheetItems}
      />
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
      <ReportBottomSheet
        visible={isReportSheetVisible}
        type="user"
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  participatingChallengeWrapper: {
    paddingTop: verticalScale(8),
  },
  tabContentListWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: verticalScale(32),
  },
  tabContentText: {
    ...typography.md,
    color: colors.text.secondary,
  },
  emptyCertificationContainer: {
    paddingVertical: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGridContainer: {
    marginHorizontal: -scale(20),
  },
});

export default UserScreen;
