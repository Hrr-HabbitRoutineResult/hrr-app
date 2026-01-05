import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, typography } from '../design/tokens';
import { Header } from '../components/common/Header';
import { NotificationItem } from '../components/notification/NotificationItem';
import LogoGray from '../../assets/images/logo-gray.svg';

// 임시 데이터 타입 (API 연동 전)
interface NotificationItemData {
  id: string;
  type: 'normal' | 'challenge_ending';
  profileImage: number;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
}

const NotificationsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<string>('챌린지');

  // const filters = ['챌린지', '인증', '팔로우', '뱃지'];
  const filters = ['챌린지'];  // 1차 구현

  // 임시 데이터 (API 연동 전)
  const mockNotifications: NotificationItemData[] = [
    {
      id: '1',
      type: 'normal',
      profileImage: require('../../assets/images/mock-challenge-profile.png'),
      title: '빈자리가 있어요',
      description: '자잘자잘 챌린지에 빈자리가 생겼어요! 지금 바로 챌린지에 참여해보세요',
      timeAgo: '1분 전',
      isRead: false,
    },
    {
      id: '2',
      type: 'challenge_ending',
      profileImage: require('../../assets/images/mock-challenge-profile.png'),
      title: '정처기 챌린지 종료 3일 전이에요',
      description: '다음 라운드에도 참여하시겠어요?\n내일까지 연장 여부를 알려주세요!',
      timeAgo: '1분 전',
      isRead: true,
    },
  ];

  const handleYesPress = (id: string) => {
    console.log('네 버튼 클릭:', id);
    // TODO: API 연동
  };

  const handleNoPress = (id: string) => {
    console.log('아니오 버튼 클릭:', id);
    // TODO: API 연동
  };

  const hasNotifications = mockNotifications.length > 0;

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="알림"
        showDivider={true}
        useSafeArea={true}
      />

      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasNotifications ? (
        <ScrollView style={styles.notificationList}>
          {mockNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              type={item.type}
              profileImage={item.profileImage}
              title={item.title}
              description={item.description}
              timeAgo={item.timeAgo}
              isRead={item.isRead}
              onYesPress={() => handleYesPress(item.id)}
              onNoPress={() => handleNoPress(item.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <LogoGray width={124.16} height={119.79} />
          <Text style={styles.emptyText}>받은 알림이 없어요</Text>
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
    lineHeight: verticalScale(21),
    marginTop: verticalScale(32),
  },
  notificationList: {
    flex: 1,
  },
});

export default NotificationsScreen;
