import React, { useState, useEffect } from 'react';
import { scale, verticalScale } from '../../utils/scaling';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/common/Text';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { createTextVerification } from '../../libs/api/challenge';
import ToggleOnIcon from '../../../assets/icons/toggle-on.svg';
import ToggleOffIcon from '../../../assets/icons/toggle-off.svg';
import PostGalleryIcon from '../../../assets/icons/challenge-profile/post-gallery.svg';
import PostLinkIcon from '../../../assets/icons/challenge-profile/post-link.svg';

type ChallengeCertificationTextScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeCertificationText'>;
type ChallengeCertificationTextScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChallengeCertificationText'
>;

export const ChallengeCertificationTextScreen: React.FC = () => {
  const navigation = useNavigation<ChallengeCertificationTextScreenNavigationProp>();
  const route = useRoute<ChallengeCertificationTextScreenRouteProp>();
  const { challengeId } = route.params;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGalleryPress = () => {
    // TODO: 갤러리에서 이미지 선택 기능 구현
    Alert.alert('알림', '갤러리 기능은 준비 중입니다.');
  };

  const handleLinkPress = () => {
    // TODO: 링크 첨부 기능 구현
    Alert.alert('알림', '링크 첨부 기능은 준비 중입니다.');
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

    try {
      setIsSubmitting(true);

      const result = await createTextVerification(challengeId, {
        title: title.trim(),
        content: content.trim(),
        textUrl: '',
        photoUrl: '',
        isQuestion: isQuestionEnabled,
      });

      // 게시글 상세 화면으로 이동
      navigation.navigate('ChallengeCertificationDetail', {
        verification: result,
      });

      // 다음 프레임에서 글 작성 화면을 스택에서 제거
      // 인증글 상세 화면에서 뒤로가기 시 글 작성으로 돌아가는 것 방지
      setTimeout(() => {
        const state = navigation.getState();
        const routes = state.routes.filter(
          (route: any) => route.name !== 'ChallengeCertificationText'
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
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && {
            paddingBottom: keyboardHeight + verticalScale(80), // 키보드 높이 + 하단 바 높이
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
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

      {/* 하단 첨부 바 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[
          styles.attachmentBar,
          isKeyboardVisible && styles.attachmentBarKeyboard,
          Platform.OS === 'android' && isKeyboardVisible && {
            bottom: keyboardHeight,
            paddingBottom: verticalScale(25),
          }
        ]}>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleGalleryPress}
              activeOpacity={0.7}
            >
              <PostGalleryIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleLinkPress}
              activeOpacity={0.7}
            >
              <PostLinkIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: verticalScale(100),
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
  contentContainer: {
    height: verticalScale(208),
    backgroundColor: colors.background,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    marginBottom: verticalScale(8),
  },
  contentInput: {
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
    lineHeight: verticalScale(18),
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  attachmentBar: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(32),
    paddingTop: verticalScale(5),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  attachmentBarKeyboard: {
    paddingBottom: verticalScale(10),
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  attachmentButton: {
    width: scale(40),
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

