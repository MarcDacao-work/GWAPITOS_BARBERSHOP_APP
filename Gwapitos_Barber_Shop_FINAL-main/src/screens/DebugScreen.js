import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getLastError, clearLastError } from '../utils/errorStore';
import { Ionicons as Icon } from '@expo/vector-icons';

const DebugScreen = ({ navigation }) => {
  const [raw, setRaw] = useState(() => getLastError());

  const handleClear = () => {
    clearLastError();
    setRaw(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Icon name="arrow-back-outline" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug — Last Error</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 20 }}>
        {raw ? (
          <Text style={styles.errorText}>{typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}</Text>
        ) : (
          <Text style={styles.noError}>No error recorded.</Text>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { padding: 6 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  body: { flex: 1 },
  errorText: { color: '#ff6b6b' },
  noError: { color: '#888' },
  actions: { padding: 16, borderTopWidth: 1, borderTopColor: '#222' },
  clearBtn: { backgroundColor: '#FFD700', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  clearText: { color: '#1a1a1a', fontWeight: '700' },
});

export default DebugScreen;
