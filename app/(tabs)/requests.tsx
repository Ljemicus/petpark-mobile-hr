import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, PetParkShadow } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';

export default function RequestsTabScreen() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const role = user?.role;
  const isProvider = role === 'sitter' || role === 'oboje';
  const primaryRoute = isProvider ? '/dashboard/sitter/requests' : '/dashboard/owner/requests';
  const providerRoute = isProvider ? primaryRoute : '/dashboard/sitter/requests';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}><Ionicons name="clipboard-outline" size={26} color={Colors.orangePrimary} /></View>
        <Text style={styles.title}>Upiti, ne potvrđene rezervacije.</Text>
        <Text style={styles.subtitle}>Ovdje pratiš poslane i primljene zahtjeve za PetPark usluge. Potvrda dolazi tek nakon dogovora s pružateljem.</Text>
      </View>

      {!isLoggedIn ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Prijava je potrebna</Text>
          <Text style={styles.noticeText}>Prijavi se za pregled svojih upita i razgovora.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.primaryButtonText}>Prijavi se</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardStack}>
          <RequestLink
            icon="send-outline"
            title="Moji poslani upiti"
            text="Status, poruke i sljedeći korak za upite koje si poslao/la."
            onPress={() => router.push('/dashboard/owner/requests' as any)}
          />
          <RequestLink
            icon="briefcase-outline"
            title="Upiti za moje usluge"
            text="Pregled dolaznih zahtjeva za pružatelje usluga."
            onPress={() => router.push(providerRoute as any)}
          />
          <RequestLink
            icon="person-circle-outline"
            title="Moj dashboard"
            text="Profil, usluge i ostale postavke računa."
            onPress={() => router.push(primaryRoute as any)}
          />
        </View>
      )}
    </ScrollView>
  );
}

function RequestLink({ icon, title, text, onPress }: { icon: string; title: string; text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkCard} onPress={onPress}>
      <View style={styles.linkIcon}><Ionicons name={icon as any} size={22} color={Colors.forest} /></View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.mutedText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 116 },
  hero: { backgroundColor: Colors.warmSurface, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: Colors.warmBorder, ...PetParkShadow },
  iconCircle: { width: 54, height: 54, borderRadius: 20, backgroundColor: Colors.orangeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 27, lineHeight: 32, fontWeight: '900', color: Colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: Colors.textSecondary, marginTop: 8 },
  notice: { marginTop: 16, backgroundColor: Colors.creamSurface, borderWidth: 1, borderColor: Colors.warmBorder, borderRadius: 24, padding: 18 },
  noticeTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  noticeText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: 5, marginBottom: 14 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: Colors.white, fontWeight: '900', fontSize: 15 },
  cardStack: { marginTop: 16, gap: 10 },
  linkCard: { backgroundColor: Colors.creamSurface, borderRadius: 24, borderWidth: 1, borderColor: Colors.warmBorder, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: Colors.forestSoft, alignItems: 'center', justifyContent: 'center' },
  linkCopy: { flex: 1 },
  linkTitle: { fontSize: 15, fontWeight: '900', color: Colors.text },
  linkText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginTop: 2 },
});
