import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This screen has been deprecated in favor of `CustomerHomeScreen` and
// `BarberHomeScreen`. Keeping a small placeholder to avoid accidental
// import breakage. You can safely remove this file entirely if not used.

const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>HomeScreen removed. Use CustomerHomeScreen or BarberHomeScreen.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a' 
  },
  text: { 
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },
});

export default HomeScreen;