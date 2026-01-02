import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import SubpageHeader from '../components/common/SubpageHeader';
import { colors, spacing } from '../design/tokens';
import SettingSection from '../components/MyPage/SettingSection';
import SettingItem from '../components/MyPage/SettingItem';
import { handleLogout } from '../libs/auth/logout';
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
        Alert.alert('오류', '로그아웃에 실패했습니다.');
      }
    };

    const handleWithdrawConfirm = async () => {
      setWithdrawSheetVisible(false); // 시트 닫기

      Alert.alert(
        '회원 탈퇴',
        '회원 탈퇴가 완료되었습니다.',
        [
          { text: '확인', onPress: async () => {
              // TODO: 회원 탈퇴 API 연동
              console.log('회원 탈퇴 API 호출 (현재 주석 처리됨)');
              // try {
              //   await deleteAccount(); // 실제 API 호출
              //   await handleLogout(); // 회원 탈퇴 후 로그아웃 처리
              //   navigation.reset({
              //     index: 0,
              //     routes: [{ name: 'Onboarding' }],
              //   });
              // } catch (error) {
              //   console.error('회원 탈퇴 실패:', error);
              //   Alert.alert('오류', '회원 탈퇴에 실패했습니다.');
              // }
              performLogout(); // API 연동 전 임시로 로그아웃 처리
            }
          },
        ],
        { cancelable: false }
      );
    };

    return (
        <View style={styles.container}>
            <SubpageHeader 
                title="계정 설정"
                onBackPress={() => navigation.goBack()}
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
