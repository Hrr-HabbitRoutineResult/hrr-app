import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { getErrorMessage } from '../utils/errorHandler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Header } from '../components/common/Header';
import { colors, spacing } from '../design/tokens';
import SettingSection from '../components/MyPage/SettingSection';
import SettingItem from '../components/MyPage/SettingItem';
import { handleLogout } from '../libs/auth/logout';
import { withdraw } from '../libs/api/auth'; // Import withdraw API
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { WithdrawBottomSheet } from '../components/MyPage/WithdrawBottomSheet';

const AccountSettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isWithdrawSheetVisible, setWithdrawSheetVisible] = useState(false);

  const performLogout = async () => {
    try {
      await handleLogout();
      // 모든 스택 비우고 온보딩 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      const errorMessage = getErrorMessage(error, '로그아웃에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  const handleWithdrawConfirm = async () => {
    setWithdrawSheetVisible(false); // 시트 닫기

    try {
      await withdraw(); // 실제 API 호출
      Alert.alert('회원 탈퇴', '회원 탈퇴가 완료되었습니다.', [
        {
          text: '확인', onPress: async () => {
            await handleLogout(); // 회원 탈퇴 후 로그아웃 처리 (토큰 삭제 및 온보딩으로 이동)
            // handleLogout 내에서 이미 navigation.reset을 수행하므로 여기서 추가 호출 불필요
          }
        },
      ], { cancelable: false });
    } catch (error: any) {
      console.error('회원 탈퇴 실패:', error);
      const errorMessage = getErrorMessage(error, '회원 탈퇴에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="계정 설정"
        onBack={() => navigation.goBack()}
        useSafeArea
      />
      <View style={styles.content}>
        <SettingSection>
          <SettingItem
            label="로그아웃"
            onPress={() => setLogoutModalVisible(true)}
          // 아이콘 없음
          />
          <SettingItem
            label="회원 탈퇴"
            onPress={() => setWithdrawSheetVisible(true)}
          // 아이콘 없음
          />
        </SettingSection>
      </View>
      <ConfirmationModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        title="로그아웃 하시겠어요?"
        description="재로그인 시 기존 계정 기록이 복구됩니다"
        buttons={[
          { text: '네', onPress: performLogout },
          { text: '아니오', onPress: () => setLogoutModalVisible(false) },
        ]}
      />
      <WithdrawBottomSheet
        visible={isWithdrawSheetVisible}
        onClose={() => setWithdrawSheetVisible(false)}
        onConfirm={handleWithdrawConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    // justifyContent: 'center', // Removed to align to top
    // alignItems: 'center', // Removed to align to top
  }
});

export default AccountSettingsScreen;
