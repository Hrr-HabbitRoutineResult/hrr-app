import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../design/tokens';
import LogoGray from '../../assets/images/logo-gray.svg';

import { Header } from '../components/common/Header';
import HamburgerIcon from '../../assets/icons/more.svg';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.safeArea}>
      <Header
        title="프로필"
        showDivider
        useSafeArea
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            onPress={() => {
              // TODO: 햄버거 버튼 클릭 시 동작(예: 메뉴 열기)
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.iconButton}
          >
            <HamburgerIcon/>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <LogoGray width={124.16} height={119.79} />
          <Text style={styles.emptyText}>아직 준비 중이에요.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 32,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyScreen;
