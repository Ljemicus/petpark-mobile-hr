import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, PetParkShadow } from '../../lib/colors';

const services = [
  { title: 'Čuvanje', subtitle: 'Provjereni ljudi za dan, vikend ili putovanje.', icon: 'home-outline', route: '/(tabs)/search' },
  { title: 'Šetnja', subtitle: 'Dnevna pomoć kad raspored pobjegne.', icon: 'footsteps-outline', route: '/walk' },
  { title: 'Njega / grooming', subtitle: 'Kupanje, šišanje i uredan ljubimac.', icon: 'cut-outline', route: '/grooming' },
  { title: 'Trening', subtitle: 'Dresura, navike i bolja komunikacija.', icon: 'school-outline', route: '/training' },
];

const communityTools = [
  { title: 'Izgubljeni ljubimci', text: 'Brzo objavi upozorenje i uključi lokalnu zajednicu.', icon: 'alert-circle-outline', route: '/lost-pets', tone: Colors.orangeSoft },
  { title: 'Udomljavanje', text: 'Pomozimo ljubimcima pronaći siguran dom.', icon: 'heart-outline', route: '/(tabs)/forum', tone: Colors.tealSoft },
  { title: 'Forum i savjeti', text: 'Pitaj vlasnike, sittere i stručnjake iz PetPark zajednice.', icon: 'chatbubbles-outline', route: '/(tabs)/forum', tone: Colors.forestSoft },
];

export default function ServicesScreen() {
  const router = useRouter();
  const push = (route: string) => router.push(route as any);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="paw-outline" size={14} color={Colors.orangeDark} />
          <Text style={styles.badgeText}>PetPark usluge</Text>
        </View>
        <Text style={styles.title}>Sve što ljubimcu treba, bez osjećaja običnog shopa.</Text>
        <Text style={styles.subtitle}>Kreni od usluge, upozorenja ili savjeta — PetPark je zajednica, ne samo lista sittera.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Usluge</Text>
        <Text style={styles.sectionHint}>Čuvanje, šetnja, njega i trening</Text>
      </View>

      <View style={styles.serviceGrid}>
        {services.map((item) => (
          <TouchableOpacity key={item.title} style={styles.serviceCard} onPress={() => push(item.route)} activeOpacity={0.82}>
            <View style={styles.serviceIcon}><Ionicons name={item.icon as any} size={24} color={Colors.forest} /></View>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceText}>{item.subtitle}</Text>
            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>Otvori</Text>
              <Ionicons name="arrow-forward" size={15} color={Colors.orangePrimary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Zajednica</Text>
        <Text style={styles.sectionHint}>Pomoć kad je bitno</Text>
      </View>

      <View style={styles.communityStack}>
        {communityTools.map((item) => (
          <TouchableOpacity key={item.title} style={styles.communityCard} onPress={() => push(item.route)} activeOpacity={0.82}>
            <View style={[styles.communityIcon, { backgroundColor: item.tone }]}><Ionicons name={item.icon as any} size={22} color={Colors.forest} /></View>
            <View style={styles.communityCopy}>
              <Text style={styles.communityTitle}>{item.title}</Text>
              <Text style={styles.communityText}>{item.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedText} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 116 },
  hero: { backgroundColor: Colors.warmSurface, borderWidth: 1, borderColor: Colors.warmBorder, borderRadius: 30, padding: 20, ...PetParkShadow },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.orangeSoft, borderColor: Colors.orangeBorder, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 14 },
  badgeText: { fontSize: 12, fontWeight: '900', color: Colors.orangeDark },
  title: { fontSize: 29, lineHeight: 34, fontWeight: '900', color: Colors.text, letterSpacing: -0.9 },
  subtitle: { marginTop: 9, fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  sectionHeader: { marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 22, lineHeight: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  sectionHint: { marginTop: 3, fontSize: 13, lineHeight: 18, color: Colors.mutedText, fontWeight: '700' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: { width: '48.5%', minHeight: 190, backgroundColor: Colors.creamSurface, borderRadius: 24, borderWidth: 1, borderColor: Colors.warmBorder, padding: 14, justifyContent: 'space-between' },
  serviceIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: Colors.forestSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  serviceTitle: { fontSize: 17, lineHeight: 21, fontWeight: '900', color: Colors.text },
  serviceText: { marginTop: 6, fontSize: 13, lineHeight: 18, color: Colors.textSecondary, flex: 1 },
  cardAction: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardActionText: { fontSize: 13, fontWeight: '900', color: Colors.orangePrimary },
  communityStack: { gap: 10 },
  communityCard: { backgroundColor: Colors.creamSurface, borderRadius: 24, borderWidth: 1, borderColor: Colors.warmBorder, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  communityIcon: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  communityCopy: { flex: 1 },
  communityTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  communityText: { marginTop: 3, fontSize: 12, lineHeight: 17, color: Colors.textSecondary },
});
