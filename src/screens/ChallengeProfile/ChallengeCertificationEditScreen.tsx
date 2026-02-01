import React, { useState } from 'react';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getErrorMessage } from '../../utils/errorHandler';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { updateVerification } from '../../libs/api/challenge';

type ChallengeCertificationEditScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationEdit'>;
type ChallengeCertificationEditScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationEdit'
>;

export const ChallengeCertificationEditScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationEditScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationEditScreenRouteProp>();
  const { verification } = route.params;

  const [title, setTitle] = useState(verification.title || '');
  const [content, setContent] = useState(verification.content || '');
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 원본 값과 비교하여 변경 여부 확인
  const originalTitle = verification.title || '';
  const originalContent = verification.content || '';
  const hasChanges = title.trim() !== originalTitle.trim() || content.trim() !== originalContent.trim();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateVerification(verification.verificationId, {
        title: title.trim(),
        content: content.trim(),
      });

      Alert.alert('성공', '게시글이 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 상세 화면으로 돌아가기
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, '게시글 수정에 실패했습니다.');
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (text: string) => {
    if (text.length <= 200) {
      setContent(text);
    }
  };

  // photoUrl 정리
  const imageUri = verification.photoUrl?.endsWith('/')
    ? verification.photoUrl.slice(0, -1)
    : verification.photoUrl;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onBack={handleBack}
        title="수정"
        showDivider={true}
        rightContent={
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.7}
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.icon.gray} />
            ) : (
              <Text variant="smMd" color={hasChanges ? colors.text.primary : colors.icon.gray}>
                완료
              </Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 이미지 썸네일 */}
        <View style={styles.imageContainer}>
          <View style={styles.thumbnailContainer}>
            {imageUri && !imageError ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.thumbnailImage}
                resizeMode="cover"
                onError={(error) => {
                  setImageError(true);
                }}
              />
            ) : (
              <View style={[styles.thumbnailImage, styles.placeholderContainer]}>
                <Text variant="xsReg" color={colors.text.tertiary}>
                  {imageError ? '이미지를 불러올 수 없습니다' : '이미지 로딩 중...'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 제목 입력 필드 */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="제목을 입력하세요"
              placeholderTextColor={colors.icon.gray}
              value={title}
              onChangeText={setTitle}
              allowFontScaling={false}
            />
          </View>
        </View>

        {/* 내용 입력 필드 */}
        <View style={styles.rulesContainer}>
          <TextInput
            style={styles.rulesInput}
            placeholder="내용을 입력하세요 (200자 이내)"
            placeholderTextColor={colors.icon.gray}
            value={content}
            onChangeText={handleContentChange}
            multiline
            textAlignVertical="top"
            maxLength={200}
            allowFontScaling={false}
          />
        </View>
        <Text variant="xsReg" color={colors.text.tertiary} style={styles.characterCount}>
          {content.length}/200
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(32),
  },
  imageContainer: {
    marginBottom: verticalScale(20),
  },
  thumbnailContainer: {
    width: scale(200),
    height: verticalScale(200),
    borderRadius: scale(10),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: scale(200),
    height: verticalScale(200),
  },
  placeholderContainer: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    height: verticalScale(54),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
  },
  inputRow: {
    flex: 1,
    paddingHorizontal: scale(16),
    justifyContent: 'center',
  },
  input: {
    ...typography.smReg,
    color: colors.text.primary,
    padding: 0,
    minHeight: 40,
  },
  rulesContainer: {
    height: verticalScale(208),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    marginBottom: verticalScale(8),
  },
  rulesInput: {
    flex: 1,
    ...typography.smReg,
    color: colors.text.secondary,
    padding: 0,
  },
  characterCount: {
    marginBottom: verticalScale(20),
    textAlign: 'right',
    paddingRight: scale(4),
  },
});

