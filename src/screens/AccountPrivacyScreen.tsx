import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../components/common/Header';
import { Text } from '../components/common/Text';
import Toggle from '../components/common/Toggle';
import { colors } from '../design/tokens';
import { RootStackParamList } from '../navigation/types';
import { useUserStore } from '../store/userSlice';
import { getErrorMessage } from '../utils/errorHandler';
import { scale, verticalScale } from '../utils/scaling';

const AccountPrivacyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    userInfo,
    isLoadingUserInfo,
    fetchUserInfo,
    updateUserInfo,
  } = useUserStore();

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handlePrivacyChange = useCallback(async (nextIsPublic: boolean) => {
    try {
      await updateUserInfo({ isPublic: nextIsPublic });

      const appliedIsPublic = useUserStore.getState().userInfo?.isPublic;
      if (appliedIsPublic !== nextIsPublic) {
        Alert.alert(
          '설정 변경 안내',
          '서버에 공개 범위가 반영되지 않았어요. 잠시 후 다시 시도해 주세요.'
        );
      }
    } catch (error) {
      Alert.alert(
        '오류',
        getErrorMessage(error, '계정 공개 범위를 변경하지 못했습니다.')
      );
    }
  }, [updateUserInfo]);

  return (
    <View style={styles.container}>
      <Header
        title="계정 공개 범위"
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider
        horizontalPadding={20}
      />

      <View style={styles.content}>
        <View style={styles.copy}>
          <Text variant="md" color={colors.text.primary}>
            프로필 공개
          </Text>
          <Text
            variant="xsReg"
            color={colors.text.tertiary}
            style={styles.description}
          >
            다른 사용자가 내 프로필과 활동을 볼 수 있어요
          </Text>
        </View>

        {isLoadingUserInfo || !userInfo ? (
          <ActivityIndicator color={colors.primary.main} />
        ) : (
          <Toggle
            value={userInfo.isPublic}
            onValueChange={handlePrivacyChange}
            disabled={isLoadingUserInfo}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(24),
  },
  copy: {
    flex: 1,
    marginRight: scale(16),
  },
  description: {
    marginTop: verticalScale(4),
  },
});

export default AccountPrivacyScreen;
