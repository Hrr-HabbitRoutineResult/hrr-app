import React, { useState, useCallback, forwardRef } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { colors } from '../../design/tokens';

// onRefresh 함수를 필수로 받고, 나머지 ScrollViewProps는 그대로 전달받습니다.
interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<any>;
}

const RefreshableScrollView = forwardRef<ScrollView, RefreshableScrollViewProps>(
  ({ onRefresh, children, ...props }, ref) => {
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
        ref={ref}
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
  }
);

RefreshableScrollView.displayName = 'RefreshableScrollView';

export default RefreshableScrollView;
