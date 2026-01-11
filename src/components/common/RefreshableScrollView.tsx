import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { colors } from '../../design/tokens';

// onRefresh 함수를 필수로 받고, 나머지 ScrollViewProps는 그대로 전달받습니다.
interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<any>;
}

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({ onRefresh, children, ...props }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh failed:", error);
      // 에러가 발생해도 새로고침 인디케이터는 멈추도록 보장합니다.
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary.main]}
          tintColor={colors.primary.main}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
