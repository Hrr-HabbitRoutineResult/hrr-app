import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../design/tokens';
import Logo from '../../../assets/images/logo-primary.svg';
import BellIcon from '../../../assets/icons/alarm.svg';

const TopAppBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  // Android: 펀치홀/상태바 간섭을 피하기 위해 더 넉넉한 패딩 (24)
  // iOS: 기존 디자인 스펙 유지 (16)
  const verticalPadding = Platform.OS === 'android' ? verticalScale(24) : verticalScale(16);

  // safeAreaTop 높이 계산
  const safeAreaTop = Platform.OS === 'android'
    ? Math.max(insets.top, 24) 
    : insets.top;

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: safeAreaTop + verticalPadding,
        paddingBottom: verticalPadding - 4 // borderBottomWidth 1px + 콘텐츠 높이 차이 3px 차감
      }
    ]}>
      <View style={styles.contentContainer}>
        {/* 왼쪽 로고 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeTabs')}
          activeOpacity={0.8}
          style={styles.logoWrapper}
        >
          <Logo width={27.99} height={27} />
        </TouchableOpacity>

        {/* 오른쪽 알림 아이콘 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.8}
          style={styles.iconWrapper}
        >
          <BellIcon width={18.82} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: scale(24),
    borderBottomWidth: scale(1),
    borderBottomColor: colors.line,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrapper: {
    width: scale(28),
    height: verticalScale(27),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopAppBar;
