// Sitter Dashboard - Availability Screen
// Prikazuje kalendar za upravljanje dostupnošću

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import type { Availability } from '../../../lib/sitter-dashboard-types';
import {
  getAvailability,
  toggleAvailability,
  setBulkAvailability,
  getSitterDashboardLastError,
  clearSitterDashboardLastError,
} from '../../../lib/sitter-dashboard-db';

// Helper funkcije za datum
const getMonthData = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Pon=0, Ned=6

  return {
    daysInMonth,
    startDayOfWeek,
    monthName: firstDay.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' }),
  };
};

const formatDateKey = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const isToday = (year: number, month: number, day: number) => {
  const today = new Date();
  return (
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year
  );
};

const isPast = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Glavni komponent
export default function SitterAvailabilityScreen() {
  const { session } = useAuth();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const userId = session?.user?.id;

  // Dohvati dostupnost
  const fetchAvailability = useCallback(async () => {
    if (!userId) return;

    try {
      clearSitterDashboardLastError();
      setLoadError(null);
      const data = await getAvailability(userId);
      setAvailability(data);
      const sitterError = getSitterDashboardLastError();
      if (sitterError) setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } catch (err) {
      console.error('Error fetching availability:', err);
      setLoadError('Ne možemo učitati podatke. Povuci za osvježavanje.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailability();
    setRefreshing(false);
  }, [fetchAvailability]);

  // Toggle dostupnost za pojedini dan
  const handleToggleDay = async (dateKey: string) => {
    if (selectionMode) {
      // Dodaj/ukloni iz selekcije
      const newSelected = new Set(selectedDates);
      if (newSelected.has(dateKey)) {
        newSelected.delete(dateKey);
      } else {
        newSelected.add(dateKey);
      }
      setSelectedDates(newSelected);
      return;
    }

    const isAvailable = availability.some(
      (a) => a.date === dateKey && a.available
    );

    const success = await toggleAvailability(userId!, dateKey, !isAvailable);
    if (success) {
      fetchAvailability();
    } else {
      Alert.alert('Greška', 'Došlo je do greške pri ažuriranju dostupnosti');
    }
  };

  // Provjeri je li dan dostupan
  const isDayAvailable = (dateKey: string) => {
    return availability.some((a) => a.date === dateKey && a.available);
  };

  // Provjeri je li dan selektiran
  const isDaySelected = (dateKey: string) => {
    return selectedDates.has(dateKey);
  };

  // Postavi sve dane u mjesecu kao dostupne/nedostupne
  const handleSetAllMonth = async (available: boolean) => {
    Alert.alert(
      'Potvrda',
      `Želite li označiti sve dane u ${getMonthData(currentYear, currentMonth).monthName} kao ${available ? 'dostupne' : 'nedostupne'}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Potvrdi',
          onPress: async () => {
            const { daysInMonth } = getMonthData(currentYear, currentMonth);
            const dates: string[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
              const dateKey = formatDateKey(currentYear, currentMonth, day);
              if (!isPast(currentYear, currentMonth, day)) {
                dates.push(dateKey);
              }
            }

            const success = await setBulkAvailability(userId!, dates, available);
            if (success) {
              fetchAvailability();
              Alert.alert('Uspjeh', 'Dostupnost ažurirana');
            } else {
              Alert.alert('Greška', 'Došlo je do greške');
            }
          },
        },
      ]
    );
  };

  // Primijeni bulk akciju na selektirane datume
  const handleBulkAction = async (available: boolean) => {
    const dates = Array.from(selectedDates);
    const success = await setBulkAvailability(userId!, dates, available);
    if (success) {
      setSelectedDates(new Set());
      setSelectionMode(false);
      fetchAvailability();
      Alert.alert('Uspjeh', `Označeno ${available ? 'dostupno' : 'nedostupno'}`);
    }
  };

  // Prethodni mjesec
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Sljedeći mjesec
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generiraj grid
  const { daysInMonth, startDayOfWeek, monthName } = getMonthData(
    currentYear,
    currentMonth
  );

  const calendarDays = [];
  // Prazna polja za početak mjeseca
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Dani u mjesecu
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Broj dostupnih dana u mjesecu
  const availableDaysCount = availability.filter((a) => {
    const date = new Date(a.date);
    return (
      a.available &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header s navigacijom mjeseca */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>{monthName}</Text>
          <Text style={styles.availableText}>
            {availableDaysCount} dostupnih dana
          </Text>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Bulk actions toolbar */}
      <View style={styles.toolbar}>
        {selectionMode ? (
          <>
            <Text style={styles.selectionText}>
              {selectedDates.size} odabrano
            </Text>
            <View style={styles.toolbarButtons}>
              <TouchableOpacity
                style={[styles.toolbarButton, styles.availableButton]}
                onPress={() => handleBulkAction(true)}
              >
                <Text style={styles.toolbarButtonText}>Dostupno</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolbarButton, styles.unavailableButton]}
                onPress={() => handleBulkAction(false)}
              >
                <Text style={styles.toolbarButtonText}>Nedostupno</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedDates(new Set());
                }}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.selectModeButton}
              onPress={() => setSelectionMode(true)}
            >
              <Ionicons name="checkbox-outline" size={18} color={Colors.primary} />
              <Text style={styles.selectModeText}>Višestruki odabir</Text>
            </TouchableOpacity>
            <View style={styles.toolbarButtons}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleSetAllMonth(true)}
              >
                <Text style={styles.quickButtonText}>Svi dostupni</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleSetAllMonth(false)}
              >
                <Text style={styles.quickButtonText}>Svi nedostupni</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Calendar */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {loadError ? <InlineErrorState message={loadError} onRetry={fetchAvailability} /> : null}

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
            <Text key={day} style={styles.dayHeaderText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dateKey = formatDateKey(currentYear, currentMonth, day);
            const available = isDayAvailable(dateKey);
            const past = isPast(currentYear, currentMonth, day);
            const today = isToday(currentYear, currentMonth, day);
            const selected = isDaySelected(dateKey);

            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.dayCell,
                  styles.dayButton,
                  available && styles.availableDay,
                  past && styles.pastDay,
                  today && styles.todayDay,
                  selected && styles.selectedDay,
                ]}
                onPress={() => handleToggleDay(dateKey)}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    available && styles.availableDayText,
                    past && styles.pastDayText,
                    today && styles.todayDayText,
                    selected && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>
                {available && !past && <View style={styles.availableIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.availableLegend]} />
            <Text style={styles.legendText}>Dostupan</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.unavailableLegend]} />
            <Text style={styles.legendText}>Nedostupan</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.todayLegend]} />
            <Text style={styles.legendText}>Danas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.pastLegend]} />
            <Text style={styles.legendText}>Prošlost</Text>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Dotaknite dan da označite dostupnost. Vlasnici mogu rezervirati samo
            dostupne datume.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  monthContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  availableText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  toolbarButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  availableButton: {
    backgroundColor: '#10B981',
  },
  unavailableButton: {
    backgroundColor: '#EF4444',
  },
  toolbarButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  selectModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectModeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.card,
  },
  quickButtonText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeaderText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    margin: 4,
  },
  dayButton: {
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  availableDay: {
    backgroundColor: '#10B981',
  },
  availableDayText: {
    color: '#FFF',
  },
  availableIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pastDay: {
    backgroundColor: '#F3F4F6',
  },
  pastDayText: {
    color: '#9CA3AF',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  todayDayText: {
    color: Colors.primary,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  selectedDayText: {
    color: '#FFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availableLegend: {
    backgroundColor: '#10B981',
  },
  unavailableLegend: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  todayLegend: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  pastLegend: {
    backgroundColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
