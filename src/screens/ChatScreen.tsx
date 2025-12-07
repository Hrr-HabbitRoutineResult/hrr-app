import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../design/tokens';
import LogoGray from '../../assets/images/logo-gray.svg';

const ChatScreen = () => (
  <View style={styles.container}>
    <View style={styles.emptyContainer}>
      <LogoGray width={124.16} height={119.79} />
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
    lineHeight: 21,
    marginTop: 32,
  },
});

export default ChatScreen;
