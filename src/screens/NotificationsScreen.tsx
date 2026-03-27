import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, typography } from '../design/tokens';
import { Header } from '../components/common/Header';
import { NotificationItem as NotificationItemComponent } from '../components/notification/NotificationItem';
import {
  getNotifications,
  markNotificationAsRead,
  NotificationItem as NotificationItemType
} from '../libs/api/notification';
import { submitRoundDecision } from '../libs/api/challenge';
import LogoGray from '../../assets/images/logo-gray.svg';

// 카테고리 매핑
interface CategoryInfo {
  label: string;
  value: 'CHALLENGE' | 'VERIFICATION' | 'FOLLOW' | 'BADGE';
}

const CATEGORIES: CategoryInfo[] = [
  { label: '챌린지', value: 'CHALLENGE' },
  { label: '인증', value: 'VERIFICATION' },
  // { label: '팔로우', value: 'FOLLOW' },
  // { label: '뱃지', value: 'BADGE' },
];

const NotificationsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeCategory, setActiveCategory] = useState<'CHALLENGE' | 'VERIFICATION' | 'FOLLOW' | 'BADGE'>('CHALLENGE');
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // 알림 목록 조회 (모든 페이지)
  const fetchNotifications = async (category: 'CHALLENGE' | 'VERIFICATION' | 'FOLLOW' | 'BADGE') => {
    try {
      setLoading(true);

      // 페이지네이션: hasNext가 true면 다음 페이지 계속 요청
      let allNotifications: NotificationItemType[] = [];
      let currentPage = 1;
      let hasNext = true;

      while (hasNext) {
        const result = await getNotifications({
          category,
          page: currentPage,
          size: 10,
        });

        allNotifications = [...allNotifications, ...result.content];
        hasNext = result.hasNext;
        currentPage++;
      }

      setNotifications(allNotifications);
      setHasNext(false);
      setPage(currentPage - 1);
    } catch (error) {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 변경 시 알림 목록 재조회
  useEffect(() => {
    fetchNotifications(activeCategory);
  }, [activeCategory]);

  // 화면 포커스 시 알림 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications(activeCategory);
    }, [activeCategory])
  );

  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    }
  };

  // 알림 타입에 따른 컴포넌트 타입 결정
  const getNotificationComponentType = (type: string): 'normal' | 'challenge_ending' => {
    return type === 'CHALLENGE_EXTENSION' ? 'challenge_ending' : 'normal';
  };

  // 알림 클릭 처리 (읽음 처리 + 화면 이동)
  const handleNotificationPress = async (notification: NotificationItemType) => {
    // 읽지 않은 알림만 읽음 처리
    if (!notification.isRead) {
      try {
        const result = await markNotificationAsRead(notification.id);

        // 로컬 state 업데이트 (배경색 변경)
        if (result.isRead) {
          setNotifications(prev =>
            prev.map(item =>
              item.id === notification.id
                ? { ...item, isRead: true }
                : item
            )
          );
        }
      } catch (error) {
        // 에러 무시
      }
    }

    // 화면 이동
    if (notification.targetType === 'CHALLENGE') {
      navigation.navigate('ChallengeProfile', {
        challengeId: notification.targetId
      });
    }
  };

  const handleYesPress = async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    const challengeId = notification.targetId;

    try {
      await submitRoundDecision(challengeId, 'CONTINUE');

      // 서버에 읽음 처리 요청
      try {
        await markNotificationAsRead(id);
      } catch (error) {
        // 읽음 처리 실패해도 계속 진행
      }

      // 로컬 state 업데이트
      setNotifications(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isRead: true, isResponded: true } : item
        )
      );

      // 성공 시 알림 목록 새로고침하여 새 알림 반영
      setTimeout(() => {
        fetchNotifications(activeCategory);
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '챌린지 연장 여부 제출에 실패했습니다.';
      Alert.alert('알림', errorMessage);
    }
  };

  const handleNoPress = async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    const challengeId = notification.targetId;

    try {
      await submitRoundDecision(challengeId, 'STOP');

      // 서버에 읽음 처리 요청
      try {
        await markNotificationAsRead(id);
      } catch (error) {
        // 읽음 처리 실패해도 계속 진행
      }

      // 로컬 state 업데이트
      setNotifications(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isRead: true, isResponded: true } : item
        )
      );

      // 성공 시 알림 목록 새로고침하여 새 알림 반영
      setTimeout(() => {
        fetchNotifications(activeCategory);
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '챌린지 연장 여부 제출에 실패했습니다.';
      Alert.alert('알림', errorMessage);
    }
  };

  const hasNotifications = notifications.length > 0;

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="알림"
        showDivider={true}
        useSafeArea={true}
      />

      <View style={styles.filterContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.filterButton,
              activeCategory === category.value && styles.filterButtonActive,
            ]}
            onPress={() => setActiveCategory(category.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeCategory === category.value && styles.filterButtonTextActive,
              ]}
              allowFontScaling={false}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : hasNotifications ? (
        <ScrollView style={styles.notificationList}>
          {notifications.map((item) => (
            <NotificationItemComponent
              key={item.id}
              type={getNotificationComponentType(item.type)}
              profileImage={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/mock-challenge-profile.png')}
              title={item.title}
              description={item.message.replace(/\\n/g, '\n')}
              timeAgo={formatTimeAgo(item.createdAt)}
              isRead={item.isRead}
              showButtons={!item.isResponded}
              onPress={() => handleNotificationPress(item)}
              onYesPress={() => handleYesPress(item.id)}
              onNoPress={() => handleNoPress(item.id)}
            />
          ))}
          {loading && page > 1 && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <LogoGray width={124.16} height={119.79} />
          <Text style={styles.emptyText} allowFontScaling={false}>받은 알림이 없어요</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
    gap: scale(8),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    borderWidth: scale(1),
    borderColor: colors.line,
  },
  filterButtonActive: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  filterButtonText: {
    ...typography.xsReg,
    color: colors.text.primary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(150),
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    marginTop: verticalScale(32),
  },
  notificationList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
});

export default NotificationsScreen;
