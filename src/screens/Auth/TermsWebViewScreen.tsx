import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Header } from '../../components/common/Header';
import { colors } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';

type TermsWebViewRouteProp = RouteProp<RootStackParamList, 'TermsWebView'>;

const TermsWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TermsWebViewRouteProp>();
  const { title, url } = route.params;

  return (
    <View style={styles.container}>
      <Header
        title={title}
        onBack={() => navigation.goBack()}
        useSafeArea
        showDivider={true}
      />
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default TermsWebViewScreen;
