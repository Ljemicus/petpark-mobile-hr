import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';

const stats = [
  { label: 'Aktivni oglasi', value: '12', icon: 'heart-circle-outline', color: '#EC4899' },
  { label: 'Hitni slučajevi', value: '3', icon: 'alert-circle-outline', color: '#EF4444' },
  { label: 'Otvorene poruke', value: '18', icon: 'mail-unread-outline', color: '#F97316' },
  { label: 'Udomljeno ovaj mjesec', value: '7', icon: 'checkmark-done-circle-outline', color: '#10B981' },
];

const actions = [
  { label: 'Novi oglas', icon: 'add-circle-outline', route: '/dashboard/rescue/listings' },
  { label: 'Apelacije', icon: 'megaphone-outline', route: '/dashboard/rescue/appeals' },
  { label: 'Poruke', icon: 'chatbubble-ellipses-outline', route: '/dashboard/rescue/messages' },
  { label: 'Izgubljeni ljubimci', icon: 'search-outline', route: '/lost-pets' },
];

export default function RescueDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PetPark Rescue</Text>
          <Text style={styles.title}>Sve za skloništa i udruge na jednom mjestu</Text>
          <Text style={styles.subtitle}>Prati oglase, apelacije i upite bez lutanja po aplikaciji.</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brze akcije</Text>
          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionCard} onPress={() => router.push(action.route as any)}>
                <Ionicons name={action.icon as any} size={24} color={Colors.primary} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Što traži pažnju</Text>
          <View style={styles.feedCard}>
            <Text style={styles.feedTitle}>3 životinje čekaju hitan foster</Text>
            <Text style={styles.feedText}>Najviše interesa dolazi za male pse i mačke iz Zagreba i Rijeke. Vrijedi pojačati naslovne oglase i odgovoriti na 5 novih upita.</Text>
          </View>
          <View style={styles.feedCard}>
            <Text style={styles.feedTitle}>Apelacija “Maza” ima dobar momentum</Text>
            <Text style={styles.feedText}>67% cilja je već pokriveno. Nedostaje još jedan update i nova naslovna fotografija.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20 },
  hero: {
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  eyebrow: { color: Colors.primary, fontWeight: '700', fontSize: 13, marginBottom: 8 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: Colors.text },
  subtitle: { marginTop: 8, fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  statIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { marginTop: 4, fontSize: 13, color: Colors.textSecondary },
  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  actionLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  feedCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  feedTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  feedText: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
});
