import React, { useState } from 'react';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { createPhotoVerification } from '../../libs/api/challenge';
import ToggleOnIcon from '../../../assets/icons/toggle-on.svg';
import ToggleOffIcon from '../../../assets/icons/toggle-off.svg';

type ChallengeCertificationPostScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationPost'>;
type ChallengeCertificationPostScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationPost'
>;

export const ChallengeCertificationPostScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationPostScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationPostScreenRouteProp>();
  const { challengeId, imageUri } = route.params;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 URI 받은 그대로 사용
  React.useEffect(() => {
  }, [imageUri]);

  const handleBack = () => {
    navigation.goBack();
  };

  // S3 URL에서 s3Key 추출
  const extractS3Key = (s3Url: string): string | null => {
    try {
      // URL에서 도메인 부분 제거하고 경로만 추출
      const urlParts = s3Url.split('.amazonaws.com/');
      if (urlParts.length < 2) {
        return null;
      }

      let key = urlParts[1];
      // 끝에 슬래시가 있으면 제거
      if (key.endsWith('/')) {
        key = key.slice(0, -1);
      }

      return key;
    } catch (error) {
      return null;
    }
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    // S3 URL에서 s3Key 추출
    const s3Key = extractS3Key(imageUri);

    if (!s3Key) {
      Alert.alert('오류', '이미지 정보를 가져올 수 없습니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createPhotoVerification(challengeId, {
        title: title.trim(),
        content: content.trim(),
        s3Key,
        isQuestion: isQuestionEnabled,
      });

      // 게시글 상세 화면으로 이동
      navigation.navigate('ChallengeCertificationDetail', {
        verification: result,
      });

      // 다음 프레임에서 카메라와 글 작성 화면을 스택에서 제거
      // 인증글 상세 화면에서 뒤로가기 시 글 작성>사진 촬영으로 돌아가는 것 방지
      setTimeout(() => {
        const state = navigation.getState();
        const routes = state.routes.filter(
          (route: any) =>
            route.name !== 'ChallengeCertificationCamera' &&
            route.name !== 'ChallengeCertificationPost'
        );

        navigation.dispatch(
          CommonActions.reset({
            ...state,
            routes,
            index: routes.length - 1,
          })
        );
      }, 100);
    } catch (error: any) {

      const errorMessage = error.response?.data?.message || error.message || '게시글 작성에 실패했습니다.';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onBack={handleBack}
        title="새 게시글"
        showDivider={true}
        rightContent={
          <TouchableOpacity
            onPress={handlePost}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Text variant="smMd" color={colors.text.primary}>
                게시
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
                onLoad={() => {
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
          />
        </View>
        <Text variant="xsReg" color={colors.text.tertiary} style={styles.characterCount}>
          {content.length}/200
        </Text>

        {/* 질문 등록 토글 */}
        <View style={styles.questionSection}>
          <View style={styles.questionInfo}>
            <Text variant="md" color={colors.text.primary}>
              질문 등록
            </Text>
            <Text variant="xsReg" color={colors.text.tertiary} style={styles.questionDescription}>
              챌린저들에게 빠른 답변을 받을 수 있어요
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsQuestionEnabled(!isQuestionEnabled)}
            activeOpacity={0.7}
          >
            {isQuestionEnabled ? (
              <ToggleOnIcon width={48} height={28} />
            ) : (
              <ToggleOffIcon width={48} height={28} />
            )}
          </TouchableOpacity>
        </View>
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
  questionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  questionInfo: {
    flex: 1,
    marginRight: scale(16),
  },
  questionDescription: {
    marginTop: verticalScale(4),
  },
});
