import type { Preview } from '@storybook/react'
import React from 'react'
import { View, SafeAreaView, StyleSheet } from 'react-native'

const withLayout = (Story: any) => (
  <SafeAreaView>
    <View style={styles.container}>
      <Story />
    </View>
  </SafeAreaView>
)

const styles = StyleSheet.create({
  container: { padding: 24, rowGap: 16, columnGap: 16 }
})

const preview: Preview = {
  decorators: [withLayout],
  parameters: { controls: { expanded: true }, layout: 'fullscreen' }
}
export default preview
