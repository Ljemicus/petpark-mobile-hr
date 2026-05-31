import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';

const settings = [
  { icon: 'card-outline', title: 'Stripe povezivanje', text: 'Spojite ili osvježite payout račun za isplate.' },
  { icon: 'business-outline', title: 'Bankovni podaci', text: 'Provjerite IBAN, naziv obrta i podatke za isplatu.' },
  { icon: 'document-text-outline', title: 'Porezni podaci', text: 'OIB, poslovni subjekt i status verifikacije.' },
];

export default function SitterSettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Postavke plaćanja</Text>
          <Text style={styles.subtitle}>Ovdje su payout i Stripe kontrole dok ne spojimo puni backend flow kao na webu.</Text>
        </View>

        {settings.map((item) => (
          <TouchableOpacity key={item.title} style={styles.card} activeOpacity={0.85}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 14 },
  hero: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  copy: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardText: { marginTop: 4, fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
});
