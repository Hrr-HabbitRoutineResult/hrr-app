import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GridIconBlack from '../../../assets/icons/mypage/ic_grid_black.svg';
import GridIconGrey from '../../../assets/icons/mypage/ic_grid_grey.svg';
import ViewIconBlack from '../../../assets/icons/mypage/ic_view_black.svg';
import ViewIconGrey from '../../../assets/icons/mypage/ic_view_grey.svg';

export type ViewMode = 'grid' | 'view';

type ViewModeSwitcherProps = {
  onViewModeChange: (mode: ViewMode) => void;
  initialMode?: ViewMode;
};

const ViewModeSwitcher = ({ onViewModeChange, initialMode = 'grid' }: ViewModeSwitcherProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    onViewModeChange(mode);
  };

  return (
    <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleViewModeChange('grid')}>
            {viewMode === 'grid' ? <GridIconBlack /> : <GridIconGrey />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleViewModeChange('view')}>
            {viewMode === 'view' ? <ViewIconBlack /> : <ViewIconGrey />}
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ViewModeSwitcher;
