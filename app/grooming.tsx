import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

interface Groomer {
  id: string;
  name: string;
  salon: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  bio: string;
  services: string[];
  avatar: string;
  verified: boolean;
}

const groomers: Groomer[] = [
  { id: 'g1', name: 'Maja Tomić', salon: 'Salon Maja', city: 'Zagreb', rating: 4.9, reviewCount: 156, priceFrom: 25, bio: 'Profesionalna groomerica s 8 godina iskustva. Specijalizirana za sve pasmine.', services: ['Šišanje', 'Kupanje', 'Trimanje', 'Spa'], avatar: '🧑‍🎨', verified: true },
  { id: 'g2', name: 'Tessa', salon: 'Salon Tessa', city: 'Rijeka', rating: 4.8, reviewCount: 98, priceFrom: 20, bio: 'Najstariji grooming salon u Rijeci. Nježan pristup svakom ljubimcu.', services: ['Šišanje', 'Kupanje', 'Nokte', 'Uši'], avatar: '✂️', verified: true },
  { id: 'g3', name: 'Marko Boni', salon: 'Salon Boni', city: 'Rijeka', rating: 4.7, reviewCount: 67, priceFrom: 18, bio: 'Moderno opremljen salon na Osječkoj. Brza usluga, zadovoljni ljubimci.', services: ['Šišanje', 'Trimanje', 'Kupanje'], avatar: '🐩', verified: true },
  { id: 'g4', name: 'Suzana V.', salon: 'Mambo', city: 'Zagreb', rating: 4.9, reviewCount: 203, priceFrom: 30, bio: 'Predsjednica Grooming sekcije HKS. Premium usluga za zahtjevne vlasnike.', services: ['Premium šišanje', 'Show grooming', 'Spa', 'Trimanje'], avatar: '👑', verified: true },
  { id: 'g5', name: 'DOG BAR', salon: 'DOG BAR Salon', city: 'Rijeka', rating: 4.6, reviewCount: 54, priceFrom: 22, bio: 'Opuštena atmosfera, ljubimac se osjeća kao doma. Self-service kupanje dostupno!', services: ['Kupanje', 'Šišanje', 'Self-service', 'Nokte'], avatar: '🛁', verified: false },
  { id: 'g6', name: 'La Bestia', salon: 'La Bestia Dog Center', city: 'Zagreb', rating: 4.8, reviewCount: 145, priceFrom: 28, bio: 'Academy + grooming + igraonica. Kompletna briga za vašeg ljubimca.', services: ['Šišanje', 'Kupanje', 'Igraonica', 'Academy'], avatar: '🏆', verified: true },
  { id: 'g7', name: 'NannyDog', salon: 'NannyDog Studio', city: 'Split', rating: 4.7, reviewCount: 78, priceFrom: 22, bio: 'Grooming + rad sa psima. Prirodan pristup njezi vašeg ljubimca.', services: ['Šišanje', 'Kupanje', 'Dresura', 'Njega'], avatar: '🐕', verified: true },
  { id: 'g8', name: 'Aria', salon: 'Grooming Studio Aria', city: 'Labin', rating: 4.5, reviewCount: 38, priceFrom: 20, bio: 'Istarsko sunce i ljubav prema životinjama. Dolazim i na kućnu adresu!', services: ['Šišanje', 'Kupanje', 'Mobilni grooming'], avatar: '☀️', verified: false },
];

export default function GroomingScreen() {
  const router = useRouter();

  const renderGroomer = ({ item }: { item: Groomer }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.verified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
          </View>
          <Text style={styles.salon}>{item.salon}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.city}>{item.city}</Text>
          </View>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceFrom}>od</Text>
          <Text style={styles.price}>{item.priceFrom}€</Text>
        </View>
      </View>
      
      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      
      <View style={styles.servicesRow}>
        {item.services.map((s, i) => (
          <View key={i} style={styles.serviceChip}>
            <Text style={styles.serviceText}>{s}</Text>
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
          <Text style={styles.bookBtnText}>Rezerviraj</Text>
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
        <Text style={styles.headerTitle}>✂️ Grooming</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={groomers}
        renderItem={renderGroomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Pronađi groomera</Text>
            <Text style={styles.introSub}>Premium saloni za njegu vašeg ljubimca</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{groomers.length}</Text>
                <Text style={styles.statLabel}>Groomera</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>4</Text>
                <Text style={styles.statLabel}>Grada</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>od 18€</Text>
                <Text style={styles.statLabel}>Cijena</Text>
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
  statNum: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: '#999' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  cardInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  salon: { fontSize: 13, color: '#666', marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  city: { fontSize: 12, color: '#999' },
  priceTag: { alignItems: 'center', backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceFrom: { fontSize: 10, color: '#999' },
  price: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  bio: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  serviceChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  serviceText: { fontSize: 11, color: '#666', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: '#333' },
  reviews: { fontSize: 12, color: '#999' },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
