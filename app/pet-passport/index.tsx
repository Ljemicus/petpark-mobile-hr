import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { getOwnerPets } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import type { Pet } from '../../lib/types';
import { SPECIES_LABELS, SPECIES_EMOJI } from '../../lib/types';

export default function PetPassportIndex() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const petsData = await getOwnerPets(user.id);
      setPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPets();
  }, [loadPets]);

  const navigateToPassport = (petId: string) => {
    router.push(`/pet-passport/${petId}`);
  };

  const renderPetCard = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => navigateToPassport(pet.id)}
      activeOpacity={0.8}
    >
      <View style={styles.petHeader}>
        <View style={styles.petAvatar}>
          {pet.photo_url ? (
            <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
          ) : (
            <Text style={styles.petEmoji}>{SPECIES_EMOJI[pet.species]}</Text>
          )}
        </View>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {pet.breed || SPECIES_LABELS[pet.species]}
            {pet.age ? ` • ${pet.age} god.` : ''}
            {pet.weight ? ` • ${pet.weight} kg` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.muted} />
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="medical" size={16} color="#0284C7" />
          </View>
          <Text style={styles.statLabel}>Cijepljenja</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text" size={16} color="#D97706" />
          </View>
          <Text style={styles.statLabel}>Dokumenti</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="calendar" size={16} color="#16A34A" />
          </View>
          <Text style={styles.statLabel}>Termini</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="paw" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Nemate dodanih ljubimaca</Text>
      <Text style={styles.emptySubtitle}>
        Dodajte svog ljubimca da biste vodili evidenciju o cijepljenjima, zdravlju i terminima.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Pet Passport</Text>
        <Text style={styles.headerSubtitle}>
          Zdravstveni karton i evidencija vaših ljubimaca
        </Text>
      </View>

      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  listContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  petCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petEmoji: {
    fontSize: 28,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
