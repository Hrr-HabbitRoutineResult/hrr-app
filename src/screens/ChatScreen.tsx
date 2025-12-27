import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale } from '../utils/scaling';
import { colors, typography } from '../design/tokens';
import LogoGray from '../../assets/images/logo-gray.svg';

const ChatScreen = () => (
  <View style={styles.container}>
    <View style={styles.emptyContainer}>
      <LogoGray width={scale(124.16)} height={verticalScale(119.79)} />
      <Text style={styles.emptyText}>아직 준비 중이에요.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.smReg,
    color: colors.icon.gray,
    textAlign: 'center',
    lineHeight: verticalScale(21),
    marginTop: verticalScale(32),
  },
});

export default ChatScreen;
