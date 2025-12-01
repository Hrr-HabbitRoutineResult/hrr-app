import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';
import BackIcon from '../../../assets/icons/back.svg';

interface HeaderProps {
    onBack?: () => void;              // 뒤로가기 버튼 클릭 핸들러
    title?: string;                   // 중앙에 표시할 제목 텍스트
    showDivider?: boolean;            // 구분선 표시 여부
    rightContent?: React.ReactNode;   // 오른쪽 영역에 표시할 커스텀 컨텐츠 (건너뛰기 버튼, 아이콘 등)
}

// 공통 Header 컴포넌트
export const Header: React.FC<HeaderProps> = ({
  onBack,
  title,
  showDivider = false,
  rightContent,
}) => {
  return (
    <>
      <View style={styles.header}>
        {/* 왼쪽: 뒤로가기 버튼 */}
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <BackIcon width={9} height={18} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        {/* 중앙: 제목 */}
        {title ? (
          <Text variant="md" color={colors.text.primary} style={styles.headerTitle}>
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

      {/* 구분선 */}
      {showDivider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  rightContentContainer: {
    minWidth: 24,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
});
