import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../lib/colors';

export default function RescueAppealsScreen() {
  const appeals = [
    { title: 'Operacija za Mazu', amount: '1.340 / 2.000€', note: 'Još 4 dana aktivno' },
    { title: 'Hrana za 12 štenaca', amount: '420 / 600€', note: 'Odličan odaziv zajednice' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {appeals.map((appeal) => (
          <View key={appeal.title} style={styles.card}>
            <Text style={styles.title}>{appeal.title}</Text>
            <Text style={styles.amount}>{appeal.amount}</Text>
            <Text style={styles.note}>{appeal.note}</Text>
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
  title: { fontSize: 16, fontWeight: '800', color: Colors.text },
  amount: { marginTop: 8, fontSize: 22, fontWeight: '800', color: Colors.primary },
  note: { marginTop: 6, fontSize: 14, color: Colors.textSecondary },
});
