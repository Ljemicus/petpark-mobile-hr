// Owner Dashboard - Pets Screen
// Prikazuje sve ljubimce i omogućuje dodavanje/uređivanje

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { Pet, Species } from '../../../lib/owner-dashboard-types';
import { SPECIES_LABELS } from '../../../lib/owner-dashboard-types';
import {
  getPetsByOwner,
  createPet,
  updatePet,
  deletePet,
} from '../../../lib/owner-dashboard-db';

const SPECIES_OPTIONS: { value: Species; icon: string; color: string }[] = [
  { value: 'dog', icon: 'paw', color: '#F97316' },
  { value: 'cat', icon: 'logo-octocat', color: '#14B8A6' },
  { value: 'other', icon: 'help-circle', color: '#8B5CF6' },
];

// Pet Card komponenta
function PetCard({
  pet,
  onEdit,
  onDelete,
}: {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
}) {
  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return 'paw';
      case 'cat':
        return 'logo-octocat';
      default:
        return 'help-circle';
    }
  };

  const getSpeciesColor = (species: string) => {
    switch (species) {
      case 'dog':
        return '#F97316';
      case 'cat':
        return '#14B8A6';
      default:
        return '#8B5CF6';
    }
  };

  return (
    <View style={styles.petCard}>
      <View style={styles.petCardContent}>
        {pet.photo_url ? (
          <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
        ) : (
          <View
            style={[
              styles.petPlaceholder,
              { backgroundColor: getSpeciesColor(pet.species) },
            ]}
          >
            <Ionicons name={getSpeciesIcon(pet.species) as any} size={32} color="#FFF" />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {SPECIES_LABELS[pet.species]}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </Text>
          <View style={styles.petMeta}>
            {pet.age && (
              <View style={styles.petMetaBadge}>
                <Text style={styles.petMetaText}>{pet.age} god.</Text>
              </View>
            )}
            {pet.weight && (
              <View style={styles.petMetaBadge}>
                <Text style={styles.petMetaText}>{pet.weight} kg</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {pet.special_needs && (
        <View style={styles.specialNeedsBanner}>
          <Ionicons name="alert-circle" size={14} color="#92400E" />
          <Text style={styles.specialNeedsText}>{pet.special_needs}</Text>
        </View>
      )}

      <View style={styles.petActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(pet)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={[styles.actionButtonText, { color: Colors.primary }]}>Uredi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(pet.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Obriši</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Add/Edit Pet Modal
function PetModal({
  visible,
  onClose,
  onSave,
  editingPet,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (petData: any) => void;
  editingPet: Pet | null;
}) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');

  useEffect(() => {
    if (editingPet) {
      setName(editingPet.name);
      setSpecies(editingPet.species);
      setBreed(editingPet.breed || '');
      setAge(editingPet.age?.toString() || '');
      setWeight(editingPet.weight?.toString() || '');
      setSpecialNeeds(editingPet.special_needs || '');
    } else {
      setName('');
      setSpecies('dog');
      setBreed('');
      setAge('');
      setWeight('');
      setSpecialNeeds('');
    }
  }, [editingPet, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Greška', 'Unesite ime ljubimca');
      return;
    }
    onSave({
      name: name.trim(),
      species,
      breed: breed.trim() || null,
      age: age ? parseInt(age) : null,
      weight: weight ? parseFloat(weight) : null,
      special_needs: specialNeeds.trim() || null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPet ? 'Uredi ljubimca' : 'Dodaj ljubimca'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Ime *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Unesite ime ljubimca"
              placeholderTextColor={Colors.muted}
            />

            <Text style={styles.inputLabel}>Vrsta</Text>
            <View style={styles.speciesContainer}>
              {SPECIES_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.speciesButton,
                    species === option.value && { backgroundColor: `${option.color}20`, borderColor: option.color },
                  ]}
                  onPress={() => setSpecies(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={species === option.value ? option.color : Colors.muted}
                  />
                  <Text
                    style={[
                      styles.speciesLabel,
                      species === option.value && { color: option.color, fontWeight: '700' },
                    ]}
                  >
                    {SPECIES_LABELS[option.value]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Rasa</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="npr. Zlatni retriver"
              placeholderTextColor={Colors.muted}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Dob (godine)</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={Colors.muted}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Težina (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor={Colors.muted}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Posebne potrebe</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialNeeds}
              onChangeText={setSpecialNeeds}
              placeholder="Npr. alergije, lijekovi, specijalna dijeta..."
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingPet ? 'Spremi promjene' : 'Dodaj ljubimca'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Glavni komponent
export default function PetsScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const params = useLocalSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const userId = session?.user?.id;

  // Provjeri parametre za otvaranje modala
  useEffect(() => {
    if (params.action === 'add') {
      setEditingPet(null);
      setModalVisible(true);
    } else if (params.edit) {
      const petToEdit = pets.find((p) => p.id === params.edit);
      if (petToEdit) {
        setEditingPet(petToEdit);
        setModalVisible(true);
      }
    }
  }, [params, pets]);

  const fetchPets = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getPetsByOwner(userId);
      setPets(data);
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);

  const handleAddPet = () => {
    setEditingPet(null);
    setModalVisible(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setModalVisible(true);
  };

  const handleDeletePet = (petId: string) => {
    Alert.alert(
      'Potvrda brisanja',
      'Jeste li sigurni da želite obrisati ovog ljubimca?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePet(petId);
            if (success) {
              Alert.alert('Uspjeh', 'Ljubimac obrisan');
              fetchPets();
            } else {
              Alert.alert('Greška', 'Brisanje nije uspjelo');
            }
          },
        },
      ]
    );
  };

  const handleSavePet = async (petData: any) => {
    if (!userId) return;

    const data = {
      ...petData,
      owner_id: userId,
      photo_url: null,
    };

    let success = false;
    if (editingPet) {
      const result = await updatePet(editingPet.id, data);
      success = !!result;
    } else {
      const result = await createPet(data);
      success = !!result;
    }

    if (success) {
      setModalVisible(false);
      fetchPets();
      Alert.alert('Uspjeh', editingPet ? 'Ljubimac ažuriran' : 'Ljubimac dodan');
    } else {
      Alert.alert('Greška', 'Spremanje nije uspjelo');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moji ljubimci</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Pets List */}
        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="paw-outline" size={60} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nemate dodanih ljubimaca</Text>
            <Text style={styles.emptyStateSubtitle}>
              Dodajte svog prvog ljubimca da biste mogli napraviti rezervaciju
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddPet}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.emptyStateButtonText}>Dodaj ljubimca</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.petsList}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <PetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePet}
        editingPet={editingPet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petsList: {
    gap: 12,
  },
  petCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  petPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: 14,
  },
  petName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  petBreed: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  petMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  petMetaBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  petMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specialNeedsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  specialNeedsText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  petActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#FFF7ED',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  speciesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  speciesButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speciesLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
