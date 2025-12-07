import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Text } from '../components/common/Text';
import { colors } from '../design/tokens';
import RandomMissionFrame from '../../assets/images/random-mission-frame.svg';

const RandomMissionScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCertify = () => {
    // TODO: 인증하기 로직 구현
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={handleBack} title="랜덤미션" showDivider />

      <View style={styles.content}>
        <Text variant="header1" color={colors.text.primary} style={styles.mainTitle}>
          미션에 참여하고{'\n'}플로우 스코어를 받아요!
        </Text>

        {/* 이미지 + 오버레이 + 텍스트 컨테이너 */}
        <View style={styles.imageContainer}>
          {/* 임시 회색 배경 (추후 이미지로 대체) */}
          <View style={styles.placeholder} />

          {/* 그라데이션 오버레이 */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.16)', 'rgba(0, 0, 0, 0.8)']}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* 프레임 오버레이 */}
          <View style={styles.frameOverlay}>
            <RandomMissionFrame width="90%" height="90%" preserveAspectRatio="none" />
          </View>

          {/* 텍스트 오버레이 */}
          <View style={styles.textOverlay}>
            <Text variant="header1" color={colors.white} style={styles.missionTitle}>
              건강식 한 끼 먹기
            </Text>
            <Text variant="smMd" color={colors.white} style={styles.missionDescription}>
              운동에 관심이 많은 당신, 한 끼는 건강하게 챙겨요!
            </Text>
          </View>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <Button variant="primary" onPress={handleCertify}>
          인증하기
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    marginTop: 28,
    marginBottom: 32,
    lineHeight: 30,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.line,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  frameOverlay: {
    paddingLeft: 30,
    paddingTop: 32,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 0,
    paddingLeft: 24,
    paddingBottom: 28,
    zIndex: 3,
  },
  missionTitle: {
    marginBottom: 6,
  },
  missionDescription: {
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
});

export default RandomMissionScreen;
