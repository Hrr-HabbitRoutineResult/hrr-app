import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type ChallengeListScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeList'>;

type Props = {
  route: ChallengeListScreenRouteProp;
};

const ChallengeListScreen = ({ route }: Props) => {
  const { category, recommend } = route.params;

  return (
    <View style={styles.container}>
      <Text>챌린지 목록</Text>
      {category && <Text>카테고리: {category}</Text>}
      {recommend && <Text>추천 챌린지</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChallengeListScreen;
