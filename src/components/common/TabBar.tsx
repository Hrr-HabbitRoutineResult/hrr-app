import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors } from '../../design/tokens';

export interface TabItem {
  key: string;    // 탭의 고유 키
  label: string;  // 탭에 표시될 텍스트
}

interface TabBarProps {
  tabs: TabItem[];  // 탭 아이템 배열
  activeTab: string;  // 현재 활성화된 탭의 키
  onTabChange: (tabKey: string) => void;  // 탭 변경 이벤트 핸들러
}

// 공통 TabBar 컴포넌트
export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              variant={activeTab === tab.key ? 'xsMd' : 'xsReg'}
              color={activeTab === tab.key ? colors.primary.main : colors.text.secondary}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tabDivider} />
    </>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    width: 48,
    height: 3,
    backgroundColor: colors.primary.main,
  },
  tabDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 20,
  },
});

