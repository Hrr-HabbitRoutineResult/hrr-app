import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { scale, verticalScale } from '../../utils/scaling';
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
  scrollable?: boolean;  // 가로 스크롤 가능 여부 (기본값: false)
  tabWidth?: number;
  tabHeight?: number;
  tabGap?: number;
  horizontalPadding?: number;
}

// 공통 TabBar 컴포넌트
// scrollable=false -> flexDirection: row로 균등 분배 (2개 탭에 적합)
// scrollable=true -> 가로 스크롤 가능, 고정 크기 탭 (6개 이상 탭에 적합) 사용
export const TabBar: React.FC<TabBarProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  scrollable = false,
  tabWidth = scale(80),
  tabHeight = verticalScale(48),
  tabGap = scale(4),
  horizontalPadding = scale(20),
}) => {
  // scrollable=true 일 때 사용
  if (scrollable) {
    return (
      <>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollableTabContainer,
            { paddingLeft: horizontalPadding, paddingRight: horizontalPadding }
          ]}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.scrollableTab,
                {
                  width: tabWidth,
                  height: tabHeight,
                  marginRight: index < tabs.length - 1 ? tabGap : 0,
                }
              ]}
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
        </ScrollView>
        <View style={styles.tabDividerFullWidth} />
      </>
    );
  }

  // scrollable=false 일 때 사용
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
    paddingTop: verticalScale(16),
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: verticalScale(12),
    position: 'relative',
  },
  scrollableTabContainer: {
    flexDirection: 'row',
    paddingTop: 0,
    paddingBottom: 0,
  },
  scrollableTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(6),
    position: 'relative',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    width: scale(48),
    height: verticalScale(3),
    backgroundColor: colors.primary.main,
  },
  tabDivider: {
    height: verticalScale(1),
    backgroundColor: colors.line,
    marginHorizontal: scale(20),
  },
  tabDividerFullWidth: {
    height: verticalScale(1),
    backgroundColor: colors.line,
    marginHorizontal: 0,
  },
});

