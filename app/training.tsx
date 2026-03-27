import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

interface Trainer {
  id: string;
  name: string;
  business: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  bio: string;
  specializations: string[];
  avatar: string;
  certified: boolean;
}

const trainers: Trainer[] = [
  { id: 't1', name: 'Centar Kliker', business: 'Centar Kliker', city: 'Zagreb', rating: 4.9, reviewCount: 234, priceFrom: 30, bio: 'Pozitivna motivacija, grupni i individualni treninzi. Potražni psi, agility, rally poslušnost.', specializations: ['Osnovna poslušnost', 'Agility', 'Potražni psi', 'Rally'], avatar: '🎯', certified: true },
  { id: 't2', name: 'Kala K9 Academy', business: 'Kala K9', city: 'Zagreb', rating: 4.8, reviewCount: 187, priceFrom: 35, bio: 'Board & Train program. Pokrivamo Zagreb, Veliku Goricu, Sisak, Samobor i Makarsku.', specializations: ['Board & Train', 'Poslušnost', 'Agility', 'Socijalizacija'], avatar: '🏋️', certified: true },
  { id: 't3', name: 'K9 Team Zagreb', business: 'K9 Team', city: 'Zagreb', rating: 4.7, reviewCount: 145, priceFrom: 25, bio: 'Specijalizirani za socijalizaciju, rad s agresivnim psima i zaštitarsku dresuru (PPD).', specializations: ['Socijalizacija', 'Agresivni psi', 'PPD', 'Zaštita'], avatar: '🛡️', certified: true },
  { id: 't4', name: 'Ivana Knežević', business: 'Šapica Dresura', city: 'Rijeka', rating: 4.8, reviewCount: 98, priceFrom: 20, bio: 'Certificirana bihevioristica. Individualni pristup, specijalizirana za velike pasmine.', specializations: ['Biheviorizam', 'Velike pasmine', 'Šetnja na povodniku', 'Štenci'], avatar: '🐕‍🦺', certified: true },
  { id: 't5', name: 'Smart Dog', business: 'Smart Dog Academy', city: 'Zagreb', rating: 4.6, reviewCount: 89, priceFrom: 28, bio: 'Daniel Mrazovac — svi nivoi dresure plus rad s psima čuvarima. 10+ godina iskustva.', specializations: ['Svi nivoi', 'Psi čuvari', 'Poslušnost', 'Natjecanja'], avatar: '🧠', certified: true },
  { id: 't6', name: 'NannyDog', business: 'NannyDog Academy', city: 'Split', rating: 4.7, reviewCount: 67, priceFrom: 22, bio: 'Grooming + dresura u jednom. Pozitivne metode, rad sa štencima i odraslim psima.', specializations: ['Štenci', 'Osnovna poslušnost', 'Korekcija ponašanja'], avatar: '🎓', certified: true },
];

export default function TrainingScreen() {
  const router = useRouter();

  const renderTrainer = ({ item }: { item: Trainer }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.certified && (
              <View style={styles.certBadge}>
                <Text style={styles.certText}>Certificiran</Text>
              </View>
            )}
          </View>
          <Text style={styles.business}>{item.business}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.city}>{item.city}</Text>
          </View>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceFrom}>od</Text>
          <Text style={styles.price}>{item.priceFrom}€</Text>
          <Text style={styles.priceUnit}>/sat</Text>
        </View>
      </View>
      
      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      
      <View style={styles.specsRow}>
        {item.specializations.map((s, i) => (
          <View key={i} style={styles.specChip}>
            <Text style={styles.specText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviewCount} recenzija)</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Kontaktiraj</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎓 Dresura & Trening</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={trainers}
        renderItem={renderTrainer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Pronađi trenera</Text>
            <Text style={styles.introSub}>Certificirani treneri za vašeg ljubimca</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{trainers.length}</Text>
                <Text style={styles.statLabel}>Trenera</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>3</Text>
                <Text style={styles.statLabel}>Grada</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>od 20€</Text>
                <Text style={styles.statLabel}>Po satu</Text>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  list: { padding: 16 },
  intro: { marginBottom: 20, alignItems: 'center' },
  introTitle: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 4 },
  introSub: { fontSize: 14, color: '#666', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700', color: '#8b5cf6' },
  statLabel: { fontSize: 12, color: '#999' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  cardInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  certBadge: { backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  certText: { fontSize: 10, color: '#8b5cf6', fontWeight: '600' },
  business: { fontSize: 13, color: '#666', marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  city: { fontSize: 12, color: '#999' },
  priceTag: { alignItems: 'center', backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceFrom: { fontSize: 10, color: '#999' },
  price: { fontSize: 18, fontWeight: '800', color: '#8b5cf6' },
  priceUnit: { fontSize: 10, color: '#999' },
  bio: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  specChip: { backgroundColor: '#f5f3ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  specText: { fontSize: 11, color: '#8b5cf6', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: '#333' },
  reviews: { fontSize: 12, color: '#999' },
  bookBtn: { backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
