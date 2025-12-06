import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../design/tokens';
import Logo from '../../../assets/images/logo-primary.svg';
import BellIcon from '../../../assets/icons/alarm.svg';

const TopAppBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logoWrapper: {
    width: 28,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopAppBar;
