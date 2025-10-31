import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { tokens } from '../../design/tokens';

const TopAppBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeTabs')}>
        {/* 로고 이미지는 assets/logo.png에 있다고 가정합니다. */}
        <Image source={require('../../../assets/images/logo-with-text.svg')} style={styles.logo} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Notifications')}
        accessibilityLabel="알림"
        accessibilityRole="button"
      >
        {/* 알림 아이콘은 적절한 아이콘으로 교체해야 합니다. */}
        <View style={styles.notificationIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.color.white,
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    backgroundColor: tokens.color.gray,
  },
});

export default TopAppBar;
