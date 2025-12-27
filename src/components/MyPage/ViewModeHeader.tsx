import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GridIconBlack from '../../../assets/icons/mypage/ic_grid_black.svg';
import GridIconGrey from '../../../assets/icons/mypage/ic_grid_grey.svg';
import ViewIconBlack from '../../../assets/icons/mypage/ic_view_black.svg';
import ViewIconGrey from '../../../assets/icons/mypage/ic_view_grey.svg';
import ComponentHeader from '../common/ComponentHeader';

export type ViewMode = 'grid' | 'view';

type ViewModeHeaderProps = {
  title: string;
  onPressTitle?: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  initialMode?: ViewMode;
};

const ViewModeHeader = ({ title, onPressTitle, onViewModeChange, initialMode = 'grid' }: ViewModeHeaderProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    onViewModeChange(mode);
  };

  return (
    <View style={styles.container}>
        <ComponentHeader title={title} onPress={onPressTitle} />
        <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => handleViewModeChange('grid')}>
                {viewMode === 'grid' ? <GridIconBlack /> : <GridIconGrey />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewModeChange('view')}>
                {viewMode === 'view' ? <ViewIconBlack /> : <ViewIconGrey />}
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ViewModeHeader;
