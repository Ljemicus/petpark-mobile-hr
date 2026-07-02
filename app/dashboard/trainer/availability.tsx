// Trainer Availability Screen
// Upravljanje rasporedom dostupnosti

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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { TrainerAvailabilitySlot } from '../../../lib/trainer-dashboard-types';
import { DAY_LABELS } from '../../../lib/trainer-dashboard-types';
import {
  getTrainerProfile,
  getTrainerAvailability,
  addTrainerAvailabilitySlot,
  deleteTrainerAvailabilitySlot,
  deleteTrainerAvailabilityByDay,
  generateTrainerSlots,
  getTrainerDashboardDbLastError,
  clearTrainerDashboardDbLastError,
} from '../../../lib/trainer-dashboard-db';

// Time slot button
function TimeSlotButton({
  time,
  selected,
  onPress,
}: {
  time: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.timeSlot, selected && styles.timeSlotSelected]}
      onPress={onPress}
    >
      <Text style={[styles.timeSlotText, selected && styles.timeSlotTextSelected]}>
        {time}
      </Text>
    </TouchableOpacity>
  );
}

// Day slot component
function DaySlot({
  date,
  slots,
  onDeleteSlot,
  onDeleteDay,
  deletingSlotId,
}: {
  date: string;
  slots: TrainerAvailabilitySlot[];
  onDeleteSlot: (id: string) => void;
  onDeleteDay: (date: string) => void;
  deletingSlotId: string | null;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00');
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <View style={styles.dayContainer}>
      <View style={styles.dayHeader}>
        <View style={styles.dayTitleContainer}>
          <Text style={styles.dayTitle}>{formatDate(date)}</Text>
          {isToday && <View style={styles.todayBadge}><Text style={styles.todayText}>Danas</Text></View>}
        </View>
        <TouchableOpacity onPress={() => onDeleteDay(date)} style={styles.deleteDayButton}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.slotsContainer}>
        {slots.map((slot) => (
          <View key={slot.id} style={styles.slotItem}>
            <Text style={styles.slotTime}>
              {slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}
            </Text>
            <TouchableOpacity
              onPress={() => onDeleteSlot(slot.id)}
              disabled={deletingSlotId === slot.id}
            >
              {deletingSlotId === slot.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="close-circle" size={22} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

// Generate schedule modal
function GenerateScheduleModal({
  visible,
  onClose,
  onGenerate,
}: {
  visible: boolean;
  onClose: () => void;
  onGenerate: (workDays: number[], startHour: number, endHour: number) => void;
}) {
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);

  const toggleDay = (day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleGenerate = () => {
    if (workDays.length === 0) {
      Alert.alert('Greška', 'Odaberite barem jedan radni dan');
      return;
    }
    if (startHour >= endHour) {
      Alert.alert('Greška', 'Početak radnog vremena mora biti prije kraja');
      return;
    }
    onGenerate(workDays, startHour, endHour);
    onClose();
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Odustani</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Generiraj raspored</Text>
            <TouchableOpacity onPress={handleGenerate}>
              <Text style={styles.modalSave}>Generiraj</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>Radni dani</Text>
            <View style={styles.daysGrid}>
              {DAY_LABELS.map((label, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayButton, workDays.includes(idx) && styles.dayButtonActive]}
                  onPress={() => toggleDay(idx)}
                >
                  <Text style={[styles.dayButtonText, workDays.includes(idx) && styles.dayButtonTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Radno vrijeme</Text>
            <View style={styles.hoursContainer}>
              <View style={styles.hourColumn}>
                <Text style={styles.hourLabel}>Početak</Text>
                <View style={styles.hourButtons}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={`start-${h}`}
                      style={[styles.hourButton, startHour === h && styles.hourButtonActive]}
                      onPress={() => setStartHour(h)}
                    >
                      <Text style={[styles.hourButtonText, startHour === h && styles.hourButtonTextActive]}>
                        {h}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.hourColumn}>
                <Text style={styles.hourLabel}>Kraj</Text>
                <View style={styles.hourButtons}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={`end-${h}`}
                      style={[styles.hourButton, endHour === h && styles.hourButtonActive]}
                      onPress={() => setEndHour(h)}
                    >
                      <Text style={[styles.hourButtonText, endHour === h && styles.hourButtonTextActive]}>
                        {h}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalBottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Add single slot modal
function AddSlotModal({
  visible,
  trainerId,
  onClose,
  onAdd,
}: {
  visible: boolean;
  trainerId: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ];

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort()
    );
  };

  const handleSave = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Greška', 'Odaberite barem jedan termin');
      return;
    }

    setSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      for (const startTime of selectedSlots) {
        const endHour = parseInt(startTime.split(':')[0]) + 1;
        const endTime = `${String(endHour).padStart(2, '0')}:00`;
        
        await addTrainerAvailabilitySlot({
          trainer_id: trainerId,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        });
      }
      
      onAdd();
      onClose();
      setSelectedSlots([]);
    } catch (err) {
      console.error('Error adding slots:', err);
      Alert.alert('Greška', 'Nije moguće dodati termine');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= new Date()) {
      setSelectedDate(newDate);
      setSelectedSlots([]);
    }
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Limit to 3 months ahead
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (newDate <= maxDate) {
      setSelectedDate(newDate);
      setSelectedSlots([]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Odustani</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Dodaj termine</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.modalSave}>Spremi</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dateSelector}>
            <TouchableOpacity onPress={goToPrevDay} style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={goToNextDay} style={styles.dateArrow}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSectionTitle}>Odaberite termine</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((time) => (
              <TimeSlotButton
                key={time}
                time={time}
                selected={selectedSlots.includes(time)}
                onPress={() => toggleSlot(time)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TrainerAvailabilityScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [availability, setAvailability] = useState<TrainerAvailabilitySlot[]>([]);
  const [trainerId, setTrainerId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [addSlotModalVisible, setAddSlotModalVisible] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const userId = session?.user?.id;

  // Dohvati podatke
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearTrainerDashboardDbLastError();
      const [profileData, availabilityData] = await Promise.all([
        getTrainerProfile(userId),
        getTrainerAvailability(userId),
      ]);

      if (profileData) {
        setTrainerId(profileData.id);
      }
      setAvailability(availabilityData);
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Group availability by date
  const groupedAvailability = availability.reduce<Record<string, TrainerAvailabilitySlot[]>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedAvailability).sort();

  // Delete slot
  const handleDeleteSlot = async (slotId: string) => {
    setDeletingSlotId(slotId);
    try {
      const success = await deleteTrainerAvailabilitySlot(slotId);
      if (success) {
        fetchData();
      } else {
        Alert.alert('Greška', 'Nije moguće obrisati termin');
      }
    } catch (err) {
      console.error('Error deleting slot:', err);
      Alert.alert('Greška', 'Došlo je do pogreške');
    } finally {
      setDeletingSlotId(null);
    }
  };

  // Delete day
  const handleDeleteDay = async (date: string) => {
    Alert.alert(
      'Obriši dan',
      'Jeste li sigurni da želite obrisati sve termine za ovaj dan?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTrainerAvailabilityByDay(trainerId, date);
            if (success) {
              fetchData();
            } else {
              Alert.alert('Greška', 'Nije moguće obrisati termine');
            }
          },
        },
      ]
    );
  };

  // Generate schedule
  const handleGenerate = async (workDays: number[], startHour: number, endHour: number) => {
    setGenerating(true);
    try {
      const startTime = `${String(startHour).padStart(2, '0')}:00`;
      const endTime = `${String(endHour).padStart(2, '0')}:00`;
      
      const count = await generateTrainerSlots(
        trainerId,
        workDays,
        startTime,
        endTime,
        28 // Generate for 4 weeks
      );
      
      if (count > 0) {
        Alert.alert('Uspjeh', `Generirano ${count} termina za sljedeća 4 tjedna!`);
        fetchData();
      } else {
        Alert.alert('Greška', 'Nije moguće generirati raspored');
      }
    } catch (err) {
      console.error('Error generating schedule:', err);
      Alert.alert('Greška', 'Došlo je do pogreške');
    } finally {
      setGenerating(false);
    }
  };

  const dashboardError = getTrainerDashboardDbLastError();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raspored dostupnosti</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setAddSlotModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Dodaj termin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.generateButton]}
          onPress={() => setGenerateModalVisible(true)}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Generiraj raspored</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Availability list */}
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
        ) : availability.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="time-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nema postavljenih termina</Text>
            <Text style={styles.emptyStateSubtitle}>
              Dodajte termine ručno ili generirajte raspored za sljedeća 4 tjedna
            </Text>
          </View>
        ) : (
          <View style={styles.daysList}>
            {sortedDates.map((date) => (
              <DaySlot
                key={date}
                date={date}
                slots={groupedAvailability[date]}
                onDeleteSlot={handleDeleteSlot}
                onDeleteDay={handleDeleteDay}
                deletingSlotId={deletingSlotId}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <GenerateScheduleModal
        visible={generateModalVisible}
        onClose={() => setGenerateModalVisible(false)}
        onGenerate={handleGenerate}
      />

      <AddSlotModal
        visible={addSlotModalVisible}
        trainerId={trainerId}
        onClose={() => setAddSlotModalVisible(false)}
        onAdd={fetchData}
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
  placeholder: {
    width: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
  },
  daysList: {
    gap: 16,
  },
  dayContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  todayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  deleteDayButton: {
    padding: 4,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
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
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  dayButtonTextActive: {
    color: '#FFF',
  },
  hoursContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  hourColumn: {
    flex: 1,
  },
  hourLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  hourButtons: {
    gap: 6,
  },
  hourButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hourButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  hourButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  hourButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalBottomPadding: {
    height: 40,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 200,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  timeSlot: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  timeSlotTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
});
