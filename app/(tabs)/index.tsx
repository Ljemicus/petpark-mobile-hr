import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import { getPrimaryDashboardRoute } from '../../lib/navigation';
import PetParkLogo from '../../components/PetParkLogo';

const navChips = [
  { title: 'Usluge', route: '/(tabs)/search' },
  { title: 'Kako radi', route: '/(tabs)/search' },
  { title: 'Zajednica', route: '/(tabs)/forum' },
  { title: 'Blog', route: '/(tabs)/forum' },
];

const services = [
  { title: 'Čuvanje', icon: '🏠', bg: '#FBE9DB', route: '/(tabs)/search' },
  { title: 'Šetnja', icon: '🦮', bg: '#E9F0DF', route: '/walk' },
  { title: 'Grooming', icon: '✂️', bg: '#DDF4F1', route: '/grooming' },
  { title: 'Trening', icon: '🎓', bg: '#EAF3E6', route: '/training' },
  { title: 'Izgubljeni', icon: '📍', bg: '#FCE4DA', route: '/lost-pets' },
  { title: 'Udomljavanje', icon: '🐾', bg: '#FBE9DB', route: '/(tabs)/forum' },
];

const activity = [
  {
    tag: 'UPOZORENJE',
    tagBg: '#FBE9DB',
    tagColor: '#B4531C',
    title: 'Nestao mačak u Trešnjevci',
    text: 'Sivi mačak, zelenih očiju, odaziva se na ime Leo.',
    meta: 'Trešnjevka, Zagreb',
    image: require('../../assets/live-web/petpark-reference-feed-cat.png'),
  },
  {
    tag: 'PRONAĐEN',
    tagBg: '#E9F0DF',
    tagColor: '#286D45',
    title: 'Pronađen pas kod Maksimira',
    text: 'Prijateljski pas, s crnom ogrlicom.',
    meta: 'Maksimir, Zagreb',
    image: require('../../assets/live-web/petpark-reference-feed-dog.png'),
  },
  {
    tag: 'FORUM',
    tagBg: '#DDF4F1',
    tagColor: '#117B76',
    title: 'Nova tema: priprema psa za čuvanje',
    text: 'Kako pomoći psu da se osjeća sigurno i opušteno dok ste vi odsutni.',
    meta: 'Forum zajednice',
  },
  {
    tag: 'BLOG',
    tagBg: '#FBE9DB',
    tagColor: '#B4531C',
    title: 'Članak: kako odabrati groomera',
    text: 'Savjeti koji će vam pomoći pronaći pravog stručnjaka za vašeg ljubimca.',
    meta: 'PetPark blog',
  },
];

const quickLinks = [
  { title: 'Forum', text: 'Pitajte, podijelite iskustva i pomozite drugima.', icon: 'chatbubble-ellipses', bg: '#159C98', route: '/(tabs)/forum' },
  { title: 'Izgubljeni / pronađeni', text: 'Pronašli ste ljubimca ili tražite svog?', icon: 'location', bg: '#F26A00', route: '/lost-pets' },
  { title: 'Udomljavanje', text: 'Dajte dom. Promijenite život.', icon: 'heart', bg: '#C65F26', route: '/(tabs)/forum' },
  { title: 'Blog savjeti', text: 'Korisni članci i vodiči za svakog vlasnika.', icon: 'book', bg: '#2E7A63', route: '/(tabs)/forum' },
];

const trustCards = [
  { title: 'Provjereni pružatelji usluga', text: 'Sigurnost i kvaliteta', icon: 'shield-checkmark' },
  { title: 'Zajednica koja pomaže', text: 'Stručni savjeti i podrška', icon: 'people' },
  { title: 'Lokalno i pouzdano', text: 'Usluge u vašem gradu', icon: 'map' },
  { title: 'Za sve ljubimce', text: 'Psi, mačke i više', icon: 'paw' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn, needsOnboarding, user } = useAuth();
  const dashboardRoute = getPrimaryDashboardRoute(user);

  React.useEffect(() => {
    if (isLoggedIn && needsOnboarding) router.replace('/onboarding');
  }, [isLoggedIn, needsOnboarding, router]);

  const push = (route: string) => router.push(route as any);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.brand} onPress={() => push('/(tabs)')} activeOpacity={0.85}>
            <PetParkLogo width={148} />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.loginPill} onPress={() => push(isLoggedIn ? dashboardRoute : '/login')}>
              <Text style={styles.loginText}>{isLoggedIn ? 'Profil' : 'Prijava'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.draftPill} onPress={() => push(isLoggedIn ? dashboardRoute : '/onboarding')}>
              <Text style={styles.draftText}>Spremi nacrt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navRow}>
          {navChips.map((item) => (
            <TouchableOpacity key={item.title} style={styles.navChip} onPress={() => push(item.route)}>
              <Text style={styles.navChipText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Ionicons name="paw" size={14} color="#F26A00" />
            <Text style={styles.badgeText}>PetPark zajednica</Text>
          </View>
          <Text style={styles.heroTitle}>Mjesto gdje zajednica pomaže ljubimcima.</Text>
          <Text style={styles.heroSubtitle}>Usluge, upozorenja, savjeti i udomljavanje - sve za ljubimce na jednom mjestu.</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.primaryCta} onPress={() => push('/lost-pets')}>
              <Ionicons name="notifications-outline" size={19} color="#FFFFFF" />
              <Text style={styles.primaryCtaText}>Objavi upozorenje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryCta} onPress={() => push('/(tabs)/search')}>
              <Ionicons name="search-outline" size={19} color="#103D3A" />
              <Text style={styles.secondaryCtaText}>Pogledaj usluge</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroVisual}>
            <Image source={require('../../assets/live-web/petpark-reference-hero-mobile-clean.png')} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.overlayKicker}>Danas na PetParku</Text>
              <Text style={styles.overlayText}>Pronađi pomoć, objavi upozorenje ili pitaj zajednicu.</Text>
            </View>
          </View>
        </View>

        <View style={styles.serviceGrid}>
          {services.map((item) => (
            <TouchableOpacity key={item.title} style={styles.serviceCard} onPress={() => push(item.route)} activeOpacity={0.85}>
              <View style={[styles.serviceIcon, { backgroundColor: item.bg }]}> 
                <Text style={styles.serviceEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.serviceTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.activityBox}>
          <View style={styles.sectionHeadRow}>
            <View>
              <Text style={styles.eyebrow}>Zajednica</Text>
              <Text style={styles.sectionTitle}>Aktualno</Text>
            </View>
            <TouchableOpacity style={styles.allPill} onPress={() => push('/(tabs)/forum')}>
              <Text style={styles.allPillText}>Sve</Text>
              <Ionicons name="chevron-forward" size={15} color="#C65F26" />
            </TouchableOpacity>
          </View>
          <View style={styles.activityGrid}>
            {activity.map((item) => (
              <TouchableOpacity key={item.title} style={styles.activityCard} onPress={() => push('/(tabs)/forum')} activeOpacity={0.86}>
                {item.image ? <Image source={item.image} style={styles.activityImage} /> : <View style={styles.activityImageFallback}><Ionicons name="paw" size={26} color="#C65F26" /></View>}
                <View style={styles.activityCopy}>
                  <View style={styles.activityMetaRow}>
                    <Text style={[styles.tag, { backgroundColor: item.tagBg, color: item.tagColor }]}>{item.tag}</Text>
                    <Text style={styles.time}>Prije 2 h</Text>
                  </View>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityText} numberOfLines={2}>{item.text}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color="#C65F26" />
                    <Text style={styles.locationText}>{item.meta}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeadSimple}>
          <Text style={styles.eyebrow}>Prečaci</Text>
          <Text style={styles.sectionTitle}>Brzi pristup</Text>
        </View>
        <View style={styles.quickStack}>
          {quickLinks.map((item) => (
            <TouchableOpacity key={item.title} style={styles.quickCard} onPress={() => push(item.route)} activeOpacity={0.86}>
              <View style={styles.quickBubble} />
              <View style={[styles.quickIcon, { backgroundColor: item.bg }]}><Ionicons name={item.icon as any} size={23} color="#FFFFFF" /></View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickText}>{item.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B958D" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.trustGrid}>
          {trustCards.map((item) => (
            <View key={item.title} style={styles.trustCard}>
              <Ionicons name={item.icon as any} size={27} color="#2E7A63" />
              <Text style={styles.trustTitle}>{item.title}</Text>
              <Text style={styles.trustText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const webShadow = {
  shadowColor: 'rgba(80,55,25,0.12)',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 3,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF6EA' },
  container: { flex: 1, backgroundColor: '#FAF6EA' },
  content: { paddingHorizontal: 16, paddingBottom: 116 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 },

  topActions: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  loginPill: { height: 40, paddingHorizontal: 13, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F26A00', shadowColor: 'rgba(242,106,0,0.22)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 22, elevation: 2 },
  loginText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  draftPill: { height: 40, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: '#D8CBB8' },
  draftText: { color: '#123D36', fontSize: 12, fontWeight: '900' },
  navRow: { gap: 8, paddingTop: 16, paddingBottom: 2 },
  navChip: { borderRadius: 999, borderWidth: 1, borderColor: '#E2D7C6', backgroundColor: '#FFFDF8', paddingHorizontal: 13, paddingVertical: 9, ...webShadow },
  navChipText: { color: '#123D36', fontSize: 12, fontWeight: '900' },
  heroSection: { paddingTop: 26 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#E9E0D1', backgroundColor: '#FFFDF8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { color: '#C65F26', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { marginTop: 14, color: '#003B2F', fontSize: 42, lineHeight: 42, fontWeight: '900', letterSpacing: -2.3 },
  heroSubtitle: { marginTop: 14, color: '#46545A', fontSize: 16, lineHeight: 24, fontWeight: '700' },
  heroActions: { marginTop: 22, gap: 11 },
  primaryCta: { height: 50, borderRadius: 14, backgroundColor: '#F26A00', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(242,106,0,0.22)', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 1, shadowRadius: 26, elevation: 3 },
  primaryCtaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  secondaryCta: { height: 50, borderRadius: 14, backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: '#4F7772', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryCtaText: { color: '#103D3A', fontSize: 15, fontWeight: '900' },
  heroVisual: { marginTop: 26, height: 238, borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: '#FFFDF8', ...webShadow },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,253,248,0.9)', paddingHorizontal: 16, paddingVertical: 12 },
  overlayKicker: { color: '#C65F26', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  overlayText: { marginTop: 2, color: '#123D36', fontSize: 14, lineHeight: 19, fontWeight: '900' },
  serviceGrid: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  serviceCard: { width: '30.8%', minHeight: 126, borderRadius: 18, borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: '#FFFDF8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7, paddingVertical: 12, ...webShadow },
  serviceIcon: { width: 58, height: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceEmoji: { fontSize: 28, lineHeight: 32, textAlign: 'center' },
  serviceTitle: { color: '#14231D', fontSize: 12, lineHeight: 16, fontWeight: '900', textAlign: 'center' },
  activityBox: { marginTop: 34, borderRadius: 28, borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: 'rgba(255,247,236,0.74)', padding: 14, ...webShadow },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
  eyebrow: { color: '#C65F26', fontSize: 11, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  sectionTitle: { color: '#003B2F', fontSize: 30, lineHeight: 34, fontWeight: '900', letterSpacing: -1.5 },
  allPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFFDF8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  allPillText: { color: '#C65F26', fontSize: 13, fontWeight: '900' },
  activityGrid: { gap: 12 },
  activityCard: { borderRadius: 22, borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: '#FFFDF8', padding: 12, flexDirection: 'row', gap: 12, ...webShadow },
  activityImage: { width: 74, height: 74, borderRadius: 18, resizeMode: 'cover' },
  activityImageFallback: { width: 74, height: 74, borderRadius: 18, backgroundColor: '#FBE9DB', alignItems: 'center', justifyContent: 'center' },
  activityCopy: { flex: 1, minWidth: 0 },
  activityMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  tag: { overflow: 'hidden', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  time: { color: '#66736D', fontSize: 11, fontWeight: '800' },
  activityTitle: { color: '#15241E', fontSize: 15, lineHeight: 19, fontWeight: '900' },
  activityText: { marginTop: 5, color: '#5A6963', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  locationRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#C65F26', fontSize: 11, fontWeight: '900' },
  sectionHeadSimple: { marginTop: 28, marginBottom: 14 },
  quickStack: { gap: 12 },
  quickCard: { position: 'relative', overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: '#FFFDF8', padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, ...webShadow },
  quickBubble: { position: 'absolute', right: -32, top: -32, width: 96, height: 96, borderRadius: 999, backgroundColor: 'rgba(251,233,219,0.7)' },
  quickIcon: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickCopy: { flex: 1, minWidth: 0 },
  quickTitle: { color: '#17231D', fontSize: 16, lineHeight: 20, fontWeight: '900' },
  quickText: { marginTop: 6, color: '#5A6963', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  trustGrid: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trustCard: { width: '48.1%', borderRadius: 22, borderWidth: 1, borderColor: '#E7DDCC', backgroundColor: 'rgba(255,253,248,0.9)', padding: 16, ...webShadow },
  trustTitle: { marginTop: 12, color: '#003B2F', fontSize: 14, lineHeight: 20, fontWeight: '900' },
  trustText: { marginTop: 3, color: '#65746E', fontSize: 12, lineHeight: 16, fontWeight: '700' },
});
