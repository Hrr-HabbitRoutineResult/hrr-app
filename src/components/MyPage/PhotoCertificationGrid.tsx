import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { TextCertificationItem } from '../common/TextCertificationList'; // Re-using the type

interface PhotoCertificationGridProps {
  items: TextCertificationItem[];
  onItemPress?: (item: TextCertificationItem) => void;
}

const PhotoCertificationGrid: React.FC<PhotoCertificationGridProps> = ({ items, onItemPress }) => {
  return (
    <FlatList
      data={items}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => onItemPress?.(item)}>
          <Image source={item.thumbnail} style={styles.thumbnailImage} />
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default PhotoCertificationGrid;