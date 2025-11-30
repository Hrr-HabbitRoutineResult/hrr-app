import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design/tokens';
import { StyleSheet as RNStyleSheet } from 'react-native';
import Logo from '../../../assets/icons/topbar/logo.svg';
import BellIcon from '../../../assets/icons/topbar/ic_alarm.svg';

const TopAppBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* 왼쪽 로고 */}
      <TouchableOpacity
        onPress={() => navigation.navigate('HomeTabs')}
        activeOpacity={0.8}
        style={styles.logoWrapper}
      >
        <Logo width={28} height={27} />
      </TouchableOpacity>

      {/* 오른쪽 알림 아이콘 */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Notifications')}
        activeOpacity={0.8}
        style={styles.logoWrapper}
      >
        <BellIcon width={48} height={48} style={{ transform: [{ scale: 1.2 }] }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.color.white,
    paddingHorizontal: 20,
    borderBottomWidth: RNStyleSheet.hairlineWidth, // ✅ 아주 얇은 선도 표시
    borderBottomColor: '#E0E0E0', // ✅ 확실히 보이는 라인색
  },
  logoWrapper: {
    marginTop: 50,
  }
});

export default TopAppBar;
