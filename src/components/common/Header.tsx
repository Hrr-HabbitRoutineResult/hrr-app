import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { colors } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';

interface HeaderProps {
  onBack?: () => void;              // 뒤로가기 버튼 클릭 핸들러
  title?: string;                   // 중앙에 표시할 제목 텍스트
  showDivider?: boolean;            // 구분선 표시 여부
  rightContent?: React.ReactNode;   // 오른쪽 영역에 표시할 커스텀 컨텐츠 (건너뛰기 버튼, 아이콘 등)
  useSafeArea?: boolean;            // TopAppBar처럼 안전 영역을 직접 처리할지 여부 (기본값: false)
}

// 공통 Header 컴포넌트
export const Header: React.FC<HeaderProps> = ({
  onBack,
  title,
  showDivider = false,
  rightContent,
  useSafeArea = false,
}) => {
  const insets = useSafeAreaInsets();

  // 플랫폼별 기본 상단 패딩
  // Android: 펀치홀/상태바 간섭을 피하기 위해 더 넉넉한 패딩 (24)
  // iOS: 기존 디자인 스펙 유지 (16)
  const verticalPadding = Platform.OS === 'android' ? verticalScale(24) : verticalScale(16);

  // 상단 safeAreaTop 적용 여부
  // useSafeArea가 true인 경우에만 안전 영역 높이를 계산하여 더해줌
  // 이미 부모에서 SafeAreaView로 감싸고 있다면 false로 두어 이중 패딩 방지
  const safeAreaTop = useSafeArea
    ? (Platform.OS === 'android' ? Math.max(insets.top, 24) : insets.top)
    : 0;

  return (
    <View style={[
      styles.header,
      showDivider && styles.headerBorder,
      {
        paddingTop: safeAreaTop + verticalPadding,
        paddingBottom: showDivider ? verticalPadding - 1 : verticalPadding, // borderBottomWidth 1px 차감
      }
    ]}>
      {/* 왼쪽: 뒤로가기 버튼 */}
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <BackIcon width={9} height={18} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      {/* 중앙: 제목 */}
      {title ? (
        <Text variant="header4" color={colors.text.primary} style={styles.headerTitle}>
          {title}
        </Text>
      ) : (
        <View style={styles.headerTitle} />
      )}

      {/* 오른쪽: 커스텀 컨텐츠 또는 플레이스홀더 */}
      {rightContent ? (
        <View style={styles.rightContentContainer}>
          {rightContent}
        </View>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(24),
    backgroundColor: colors.white,
  },
  headerBorder: {
    borderBottomWidth: scale(1),
    borderBottomColor: colors.line,
  },
  backButton: {
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: scale(24),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  rightContentContainer: {
    minWidth: scale(24),
    alignItems: 'flex-end',
  },
  divider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
  },
});
