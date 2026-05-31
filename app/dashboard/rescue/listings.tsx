import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../lib/colors';

const listings = [
  { name: 'Luna', meta: '2 god · ženka · Zagreb', status: 'Aktivno' },
  { name: 'Beni', meta: '5 mj · mužjak · Rijeka', status: 'Hitno' },
  { name: 'Mrvica', meta: '8 god · ženka · Split', status: 'Na čekanju' },
];

export default function RescueListingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {listings.map((listing) => (
          <View key={listing.name} style={styles.card}>
            <Text style={styles.name}>{listing.name}</Text>
            <Text style={styles.meta}>{listing.meta}</Text>
            <Text style={styles.status}>{listing.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  name: { fontSize: 17, fontWeight: '800', color: Colors.text },
  meta: { marginTop: 4, fontSize: 14, color: Colors.textSecondary },
  status: { marginTop: 8, fontSize: 13, fontWeight: '700', color: Colors.primary },
});
