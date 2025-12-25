import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, typography } from '../design/tokens';
import { Header } from '../components/common/Header';
import LogoGray from '../../assets/images/logo-gray.svg';

const NotificationsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<string>('챌린지');

  const filters = ['챌린지', '인증', '팔로우', '뱃지'];

  return (
    <View style={styles.container}>
      <Header
        onBack={() => navigation.goBack()}
        title="알림"
        showDivider={true}
        useSafeArea={true}
      />
      
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.emptyContainer}>
        <LogoGray width={124.16} height={119.79} />
        <Text style={styles.emptyText}>받은 알림이 없어요</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
    gap: scale(8),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    borderWidth: scale(1),
    borderColor: colors.line,
  },
  filterButtonActive: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  filterButtonText: {
    ...typography.xsReg,
    color: colors.text.primary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(150),
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    lineHeight: verticalScale(21),
    marginTop: verticalScale(32),
  },
});

export default NotificationsScreen;
