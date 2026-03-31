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
import { logout as logoutAPI } from '../libs/api/auth';
import { withdraw } from '../libs/api/auth';
import { clearSessionLocally } from '../libs/auth/session';
import { deactivateFcmTokenSilently } from '../libs/fcm';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { WithdrawBottomSheet } from '../components/MyPage/WithdrawBottomSheet';

const AccountSettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isWithdrawSheetVisible, setWithdrawSheetVisible] = useState(false);

  const performLogout = async () => {
    try {
      await deactivateFcmTokenSilently();
      try { await logoutAPI(); } catch { /* 서버 실패는 무시 */ }
      await clearSessionLocally();
      // 로그인 화면으로 바로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthOnboarding', params: { initialStep: 'login' } }],
      });
    } catch (error) {
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
            try { await logoutAPI(); } catch { /* 서버 실패는 무시 */ }
            await clearSessionLocally();
            // 로그인 화면으로 바로 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthOnboarding', params: { initialStep: 'login' } }],
            });
          }
        },
      ], { cancelable: false });
    } catch (error: any) {
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
        showDivider={true}
      />
      <View style={styles.content}>
        <SettingSection isLast={true}>
          <SettingItem
            label="로그아웃"
            onPress={() => setLogoutModalVisible(true)}
          />
          <SettingItem
            label="회원 탈퇴"
            onPress={() => setWithdrawSheetVisible(true)}
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
  }
});

export default AccountSettingsScreen;
