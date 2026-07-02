// Trainer Programs Screen
// Upravljanje programima treniranja

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { TrainingProgram } from '../../../lib/trainer-dashboard-types';
import { TRAINING_TYPE_LABELS, CITIES } from '../../../lib/trainer-dashboard-types';
import {
  getTrainerProfile,
  getTrainerPrograms,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
  getTrainerDashboardDbLastError,
  clearTrainerDashboardDbLastError,
} from '../../../lib/trainer-dashboard-db';

// Program card komponenta
function ProgramCard({
  program,
  onEdit,
  onDelete,
}: {
  program: TrainingProgram;
  onEdit: (program: TrainingProgram) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={[styles.programIcon, { backgroundColor: '#EEF2FF' }]}>
          <Ionicons name="school" size={24} color="#6366F1" />
        </View>
        <View style={styles.programInfo}>
          <Text style={styles.programName} numberOfLines={1}>{program.name}</Text>
          <Text style={styles.programType}>{TRAINING_TYPE_LABELS[program.type]}</Text>
        </View>
      </View>

      <View style={styles.programDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{program.duration_weeks} tjedana</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{program.sessions} sesija</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{program.price}€</Text>
        </View>
      </View>

      {program.description && (
        <Text style={styles.programDescription} numberOfLines={2}>
          {program.description}
        </Text>
      )}

      <View style={styles.programActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(program)}>
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.editButtonText}>Uredi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(program.id)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Obriši</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Program form modal
function ProgramFormModal({
  visible,
  program,
  trainerId,
  onClose,
  onSave,
}: {
  visible: boolean;
  program: TrainingProgram | null;
  trainerId: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<keyof typeof TRAINING_TYPE_LABELS>('osnovna');
  const [durationWeeks, setDurationWeeks] = useState('4');
  const [sessions, setSessions] = useState('8');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (program) {
      setName(program.name);
      setType(program.type);
      setDurationWeeks(String(program.duration_weeks));
      setSessions(String(program.sessions));
      setPrice(String(program.price));
      setDescription(program.description);
    } else {
      setName('');
      setType('osnovna');
      setDurationWeeks('4');
      setSessions('8');
      setPrice('');
      setDescription('');
    }
    setErrors({});
  }, [program, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Naziv mora imati najmanje 2 znaka';
    }

    if (!durationWeeks || parseInt(durationWeeks) < 1) {
      newErrors.duration = 'Trajanje mora biti najmanje 1 tjedan';
    }

    if (!sessions || parseInt(sessions) < 1) {
      newErrors.sessions = 'Broj sesija mora biti najmanje 1';
    }

    if (!price || parseInt(price) < 0) {
      newErrors.price = 'Cijena mora biti pozitivan broj';
    }

    if (!description.trim() || description.trim().length < 5) {
      newErrors.description = 'Opis mora imati najmanje 5 znakova';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const programData = {
        trainer_id: trainerId,
        name: name.trim(),
        type,
        duration_weeks: parseInt(durationWeeks),
        sessions: parseInt(sessions),
        price: parseInt(price),
        description: description.trim(),
      };

      let success;
      if (program) {
        success = await updateTrainingProgram(program.id, programData);
      } else {
        success = await createTrainingProgram(programData);
      }

      if (success) {
        onSave();
        onClose();
      } else {
        Alert.alert('Greška', 'Nije moguće spremiti program');
      }
    } catch (err) {
      console.error('Error saving program:', err);
      Alert.alert('Greška', 'Došlo je do pogreške');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Odustani</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {program ? 'Uredi program' : 'Novi program'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.modalSave}>Spremi</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Naziv programa *</Text>
            <TextInput
              style={[styles.formInput, errors.name && styles.formInputError]}
              value={name}
              onChangeText={setName}
              placeholder="npr. Osnovna poslušnost"
              placeholderTextColor={Colors.muted}
            />
            {errors.name && <Text style={styles.formError}>{errors.name}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vrsta treninga *</Text>
            <View style={styles.typeButtons}>
              {(Object.keys(TRAINING_TYPE_LABELS) as Array<keyof typeof TRAINING_TYPE_LABELS>).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeButton, type === t && styles.typeButtonActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>
                    {TRAINING_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.formLabel}>Trajanje (tjedana) *</Text>
              <TextInput
                style={[styles.formInput, errors.duration && styles.formInputError]}
                value={durationWeeks}
                onChangeText={setDurationWeeks}
                keyboardType="number-pad"
                placeholder="4"
                placeholderTextColor={Colors.muted}
              />
              {errors.duration && <Text style={styles.formError}>{errors.duration}</Text>}
            </View>

            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.formLabel}>Broj sesija *</Text>
              <TextInput
                style={[styles.formInput, errors.sessions && styles.formInputError]}
                value={sessions}
                onChangeText={setSessions}
                keyboardType="number-pad"
                placeholder="8"
                placeholderTextColor={Colors.muted}
              />
              {errors.sessions && <Text style={styles.formError}>{errors.sessions}</Text>}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Cijena (€) *</Text>
            <TextInput
              style={[styles.formInput, errors.price && styles.formInputError]}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.muted}
            />
            {errors.price && <Text style={styles.formError}>{errors.price}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Opis programa *</Text>
            <TextInput
              style={[styles.formTextArea, errors.description && styles.formInputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Opišite što program uključuje, za koga je namijenjen, metodologiju..."
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.formError}>{errors.description}</Text>}
          </View>

          <View style={styles.modalBottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function TrainerProgramsScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { session } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [trainerId, setTrainerId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);

  const userId = session?.user?.id;

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearTrainerDashboardDbLastError();
      const [profileData, programsData] = await Promise.all([
        getTrainerProfile(userId),
        getTrainerPrograms(userId),
      ]);

      if (profileData) {
        setTrainerId(profileData.id);
      }
      setPrograms(programsData);
    } catch (err) {
      console.error('Error fetching programs data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for edit param
  useEffect(() => {
    if (edit && programs.length > 0) {
      const program = programs.find((p) => p.id === edit);
      if (program) {
        handleEdit(program);
      }
    }
  }, [edit, programs]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAdd = () => {
    setEditingProgram(null);
    setFormVisible(true);
  };

  const handleEdit = (program: TrainingProgram) => {
    setEditingProgram(program);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Obriši program',
      'Jeste li sigurni da želite obrisati ovaj program?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTrainingProgram(id);
            if (success) {
              fetchData();
            } else {
              Alert.alert('Greška', 'Nije moguće obrisati program');
            }
          },
        },
      ]
    );
  };

  const dashboardError = getTrainerDashboardDbLastError();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programi treniranja</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Programs list */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : programs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="school-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nemate programa</Text>
            <Text style={styles.emptyStateSubtitle}>
              Kreirajte programe treniranja koje nudite svojim klijentima
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAdd}>
              <Text style={styles.emptyStateButtonText}>Dodaj program</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.programsList}>
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Program form modal */}
      <ProgramFormModal
        visible={formVisible}
        program={editingProgram}
        trainerId={trainerId}
        onClose={() => setFormVisible(false)}
        onSave={fetchData}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
  },
  programsList: {
    gap: 12,
  },
  programCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programInfo: {
    marginLeft: 12,
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  programType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  programDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  programDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  programActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextArea: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  formInputError: {
    borderColor: '#EF4444',
  },
  formError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  modalBottomPadding: {
    height: 40,
  },
});
