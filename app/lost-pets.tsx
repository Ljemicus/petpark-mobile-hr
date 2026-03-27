import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

interface LostPet {
  id: string;
  emoji: string;
  name: string;
  type: string;
  breed: string;
  color: string;
  location: string;
  date: string;
  description: string;
  contact: string;
  status: 'lost' | 'found';
}

const lostPets: LostPet[] = [
  {
    id: '1',
    emoji: '🐱',
    name: 'Miki',
    type: 'Mačak',
    breed: 'Domaća kratka dlaka',
    color: 'Crni s bijelom mrljom na prsima',
    location: 'Zagreb, Maksimir',
    date: '24.03.2026.',
    description: 'Crni mačak, kastriran, vrlo prijazan. Nosi plavu ogrlicu s imenom.',
    contact: 'Petar J. — 091 234 5678',
    status: 'lost',
  },
  {
    id: '2',
    emoji: '🐕',
    name: 'Rex',
    type: 'Pas',
    breed: 'Njemački ovčar',
    color: 'Crno-smeđi',
    location: 'Split, Bačvice',
    date: '23.03.2026.',
    description: 'Veliki njemački ovčar, nosi crvenu ogrlicu. Odaziva se na ime Rex.',
    contact: 'Marko B. — 098 765 4321',
    status: 'lost',
  },
  {
    id: '3',
    emoji: '🐩',
    name: 'Bella',
    type: 'Pas',
    breed: 'Pudlica',
    color: 'Bijela',
    location: 'Rijeka, Korzo',
    date: '22.03.2026.',
    description: 'Mala bijela pudlica, šišana. Nema ogrlicu. Vrlo plašljiva.',
    contact: 'Ivana K. — 095 111 2233',
    status: 'lost',
  },
  {
    id: '4',
    emoji: '🐈',
    name: 'Luna',
    type: 'Mačka',
    breed: 'Sijamska',
    color: 'Krem s tamnim šapicama',
    location: 'Osijek, Tvrđa',
    date: '25.03.2026.',
    description: 'Sijamska mačka, plave oči, sterilizirana. Čipirana.',
    contact: 'Nina R. — 099 888 7766',
    status: 'lost',
  },
  {
    id: '5',
    emoji: '🐕‍🦺',
    name: 'Bruno',
    type: 'Pas',
    breed: 'Labrador',
    color: 'Zlatni',
    location: 'Zagreb, Jarun',
    date: '20.03.2026.',
    description: 'Zlatni labrador, 3 godine, ima mikročip. Pronađen blizu jezera.',
    contact: 'Sklonište Zagreb — 01 234 5678',
    status: 'found',
  },
  {
    id: '6',
    emoji: '🐰',
    name: 'Nepoznato',
    type: 'Kunić',
    breed: 'Patuljasti kunić',
    color: 'Smeđe-bijeli',
    location: 'Zagreb, Dubrava',
    date: '21.03.2026.',
    description: 'Pronađen mali kunić u parku. Izgleda pitom, vjerojatno kućni ljubimac.',
    contact: 'Filip N. — 091 555 4433',
    status: 'found',
  },
];

export default function LostPetsScreen() {
  const handleShare = async (pet: LostPet) => {
    const statusText = pet.status === 'lost' ? 'IZGUBLJEN' : 'PRONAĐEN';
    try {
      await Share.share({
        message: `🚨 ${statusText}: ${pet.name} (${pet.type})\n📍 ${pet.location}\n📅 ${pet.date}\n${pet.description}\n📞 Kontakt: ${pet.contact}\n\n— Šapica App 🐾`,
      });
    } catch {
      Alert.alert('Greška', 'Dijeljenje nije uspjelo.');
    }
  };

  const renderPet = ({ item }: { item: LostPet }) => {
    const isLost = item.status === 'lost';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.petEmoji}>{item.emoji}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.type} — {item.breed}</Text>
          </View>
          <View style={[styles.statusBadge, isLost ? styles.statusLost : styles.statusFound]}>
            <Text style={[styles.statusText, isLost ? styles.statusTextLost : styles.statusTextFound]}>
              {isLost ? 'Izgubljen' : 'Pronađen'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="color-palette-outline" size={16} color={Colors.muted} />
          <Text style={styles.detailText}>{item.color}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={Colors.muted} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={16} color={Colors.primary} />
          <Text style={styles.contactText}>{item.contact}</Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(item)}>
          <Ionicons name="share-social-outline" size={18} color={Colors.white} />
          <Text style={styles.shareText}>Podijeli</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const lostCount = lostPets.filter(p => p.status === 'lost').length;
  const foundCount = lostPets.filter(p => p.status === 'found').length;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={styles.statNumber}>{lostCount}</Text>
          <Text style={styles.statLabel}>Izgubljeni</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.statNumber}>{foundCount}</Text>
          <Text style={styles.statLabel}>Pronađeni</Text>
        </View>
      </View>

      <FlatList
        data={lostPets}
        renderItem={renderPet}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 20,
    paddingTop: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  petBreed: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusLost: {
    backgroundColor: '#FEF2F2',
  },
  statusFound: {
    backgroundColor: '#F0FDF4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextLost: {
    color: Colors.error,
  },
  statusTextFound: {
    color: Colors.success,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
