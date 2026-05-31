import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { getPetWithPassport, savePetPassport } from '../../lib/db';
import type { PetWithPassport, PetPassport, Vaccination, Allergy, Medication, VetInfo } from '../../lib/types';
import { SPECIES_LABELS, SPECIES_EMOJI, ALLERGY_SEVERITY_LABELS } from '../../lib/types';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'vaccinations', label: 'Cijepljenja', icon: 'medical' },
  { id: 'allergies', label: 'Alergije', icon: 'warning' },
  { id: 'medications', label: 'Lijekovi', icon: 'tablet-portrait' },
  { id: 'vet', label: 'Veterinar', icon: 'business' },
  { id: 'notes', label: 'Bilješke', icon: 'document-text' },
] as const;

type TabId = typeof TABS[number]['id'];

const SEVERITY_COLORS = {
  blaga: { bg: '#FEF3C7', text: '#D97706' },
  umjerena: { bg: '#FEE2E2', text: '#DC2626' },
  ozbiljna: { bg: '#FECACA', text: '#B91C1C' },
};

export default function PetPassportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<PetWithPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('vaccinations');
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  // Form states
  const [newVaccination, setNewVaccination] = useState<Partial<Vaccination>>({
    name: '',
    date: '',
    vet: '',
    next_date: '',
  });
  const [newAllergy, setNewAllergy] = useState<Partial<Allergy>>({
    name: '',
    severity: 'blaga',
    notes: '',
  });
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dose: '',
    schedule: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
  });
  const [vetInfo, setVetInfo] = useState<Partial<VetInfo>>({
    name: '',
    phone: '',
    address: '',
    emergency: false,
  });
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await getPetWithPassport(id);
      if (data) {
        setPet(data);
        setVetInfo(data.passport?.vet_info || { name: '', phone: '', address: '', emergency: false });
        setNotes(data.passport?.notes || '');
      }
    } catch (error) {
      console.error('Error loading pet passport:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const savePassportData = async (updates: Partial<PetPassport>) => {
    setSaving(true);
    try {
      const success = await savePetPassport(id, updates);
      if (success) {
        await loadData();
      }
      return success;
    } finally {
      setSaving(false);
    }
  };

  const addVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date) {
      Alert.alert('Greška', 'Unesite naziv i datum cijepljenja');
      return;
    }

    const vaccination: Vaccination = {
      name: newVaccination.name,
      date: newVaccination.date,
      vet: newVaccination.vet || '',
      next_date: newVaccination.next_date || '',
    };

    const updated = {
      ...pet?.passport,
      vaccinations: [...(pet?.passport?.vaccinations || []), vaccination],
    };

    if (await savePassportData(updated)) {
      setShowVaccinationModal(false);
      setNewVaccination({ name: '', date: '', vet: '', next_date: '' });
    }
  };

  const removeVaccination = async (index: number) => {
    Alert.alert(
      'Ukloni cijepljenje',
      'Jeste li sigurni da želite ukloniti ovo cijepljenje?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Ukloni',
          style: 'destructive',
          onPress: async () => {
            const updated = {
              ...pet?.passport,
              vaccinations: pet?.passport?.vaccinations?.filter((_: Vaccination, i: number) => i !== index) || [],
            };
            await savePassportData(updated);
          },
        },
      ]
    );
  };

  const addAllergy = async () => {
    if (!newAllergy.name) {
      Alert.alert('Greška', 'Unesite naziv alergije');
      return;
    }

    const allergy: Allergy = {
      name: newAllergy.name,
      severity: newAllergy.severity as 'blaga' | 'umjerena' | 'ozbiljna',
      notes: newAllergy.notes || '',
    };

    const updated = {
      ...pet?.passport,
      allergies: [...(pet?.passport?.allergies || []), allergy],
    };

    if (await savePassportData(updated)) {
      setShowAllergyModal(false);
      setNewAllergy({ name: '', severity: 'blaga', notes: '' });
    }
  };

  const removeAllergy = async (index: number) => {
    Alert.alert(
      'Ukloni alergiju',
      'Jeste li sigurni da želite ukloniti ovu alergiju?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Ukloni',
          style: 'destructive',
          onPress: async () => {
            const updated = {
              ...pet?.passport,
              allergies: pet?.passport?.allergies?.filter((_: Allergy, i: number) => i !== index) || [],
            };
            await savePassportData(updated);
          },
        },
      ]
    );
  };

  const addMedication = async () => {
    if (!newMedication.name || !newMedication.dose) {
      Alert.alert('Greška', 'Unesite naziv i dozu lijeka');
      return;
    }

    const medication: Medication = {
      name: newMedication.name,
      dose: newMedication.dose,
      schedule: newMedication.schedule || '',
      start_date: newMedication.start_date || new Date().toISOString().split('T')[0],
      end_date: newMedication.end_date || null,
    };

    const updated = {
      ...pet?.passport,
      medications: [...(pet?.passport?.medications || []), medication],
    };

    if (await savePassportData(updated)) {
      setShowMedicationModal(false);
      setNewMedication({ name: '', dose: '', schedule: '', start_date: '', end_date: null });
    }
  };

  const removeMedication = async (index: number) => {
    Alert.alert(
      'Ukloni lijek',
      'Jeste li sigurni da želite ukloniti ovaj lijek?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Ukloni',
          style: 'destructive',
          onPress: async () => {
            const updated = {
              ...pet?.passport,
              medications: pet?.passport?.medications?.filter((_: Medication, i: number) => i !== index) || [],
            };
            await savePassportData(updated);
          },
        },
      ]
    );
  };

  const saveVetInfo = async () => {
    const updated = {
      ...pet?.passport,
      vet_info: vetInfo as VetInfo,
    };
    await savePassportData(updated);
  };

  const saveNotes = async () => {
    const updated = {
      ...pet?.passport,
      notes,
    };
    await savePassportData(updated);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isVaccinationExpired = (nextDate: string) => {
    if (!nextDate) return false;
    return new Date(nextDate) < new Date();
  };

  const isVaccinationExpiringSoon = (nextDate: string) => {
    if (!nextDate) return false;
    const next = new Date(nextDate);
    const now = new Date();
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Ljubimac nije pronađen</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Natrag</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vaccinations':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowVaccinationModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj cijepljenje</Text>
            </TouchableOpacity>

            {pet.passport?.vaccinations?.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>Nema zapisanih cijepljenja</Text>
              </View>
            ) : (
              pet.passport?.vaccinations?.map((vax: Vaccination, index: number) => {
                const expired = isVaccinationExpired(vax.next_date);
                const expiringSoon = isVaccinationExpiringSoon(vax.next_date);

                return (
                  <View key={index} style={styles.vaccinationCard}>
                    <View style={styles.vaccinationHeader}>
                      <View style={styles.vaccinationTitleRow}>
                        <Text style={styles.vaccinationName}>{vax.name}</Text>
                        {vax.next_date && (
                          <View style={[
                            styles.statusBadge,
                            expired ? styles.statusExpired : expiringSoon ? styles.statusWarning : styles.statusValid
                          ]}>
                            <Text style={[
                              styles.statusText,
                              expired ? styles.statusExpiredText : expiringSoon ? styles.statusWarningText : styles.statusValidText
                            ]}>
                              {expired ? 'ISTEKLO' : expiringSoon ? 'Istiće uskoro' : 'Važeće'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => removeVaccination(index)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.vaccinationDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.muted} />
                        <Text style={styles.detailText}>{formatDate(vax.date)}</Text>
                      </View>
                      {vax.vet && (
                        <View style={styles.detailRow}>
                          <Ionicons name="business-outline" size={14} color={Colors.muted} />
                          <Text style={styles.detailText}>{vax.vet}</Text>
                        </View>
                      )}
                      {vax.next_date && (
                        <View style={styles.detailRow}>
                          <Ionicons name="time-outline" size={14} color={expired ? Colors.error : Colors.muted} />
                          <Text style={[styles.detailText, expired && styles.expiredText]}>
                            Sljedeće: {formatDate(vax.next_date)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );

      case 'allergies':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAllergyModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj alergiju</Text>
            </TouchableOpacity>

            {pet.passport?.allergies?.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>Nema zapisanih alergija</Text>
              </View>
            ) : (
              pet.passport?.allergies?.map((allergy: Allergy, index: number) => {
                const colors = SEVERITY_COLORS[allergy.severity];
                return (
                  <View key={index} style={[styles.allergyCard, { backgroundColor: colors.bg }]}>
                    <View style={styles.allergyHeader}>
                      <View>
                        <Text style={styles.allergyName}>{allergy.name}</Text>
                        <View style={[styles.severityBadge, { backgroundColor: colors.text }]}>
                          <Text style={styles.severityText}>
                            {ALLERGY_SEVERITY_LABELS[allergy.severity]}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeAllergy(index)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                    {allergy.notes && (
                      <Text style={[styles.allergyNotes, { color: colors.text }]}>
                        {allergy.notes}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        );

      case 'medications':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowMedicationModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj lijek</Text>
            </TouchableOpacity>

            {pet.passport?.medications?.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>Nema zapisanih lijekova</Text>
              </View>
            ) : (
              pet.passport?.medications?.map((med: Medication, index: number) => (
                <View key={index} style={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View>
                      <Text style={styles.medicationName}>{med.name}</Text>
                      <View style={styles.doseBadge}>
                        <Text style={styles.doseText}>{med.dose}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeMedication(index)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  {med.schedule && (
                    <Text style={styles.medicationSchedule}>{med.schedule}</Text>
                  )}
                  <Text style={styles.medicationDates}>
                    Od: {formatDate(med.start_date)}
                    {med.end_date ? ` do ${formatDate(med.end_date)}` : ' (kontinuirano)'}
                  </Text>
                </View>
              ))
            )}
          </View>
        );

      case 'vet':
        return (
          <View style={styles.tabContent}>
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Ime veterinara / klinike</Text>
              <TextInput
                style={styles.formInput}
                value={vetInfo.name}
                onChangeText={(text) => setVetInfo({ ...vetInfo, name: text })}
                placeholder="npr. VetCentar Zagreb"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Telefon</Text>
              <TextInput
                style={styles.formInput}
                value={vetInfo.phone}
                onChangeText={(text) => setVetInfo({ ...vetInfo, phone: text })}
                placeholder="+385 1 123 4567"
                placeholderTextColor={Colors.muted}
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Adresa</Text>
              <TextInput
                style={styles.formInput}
                value={vetInfo.address}
                onChangeText={(text) => setVetInfo({ ...vetInfo, address: text })}
                placeholder="Ulica i broj, grad"
                placeholderTextColor={Colors.muted}
              />

              <TouchableOpacity
                style={[styles.emergencyToggle, vetInfo.emergency && styles.emergencyToggleActive]}
                onPress={() => setVetInfo({ ...vetInfo, emergency: !vetInfo.emergency })}
              >
                <Text style={[
                  styles.emergencyToggleText,
                  vetInfo.emergency && styles.emergencyToggleTextActive
                ]}>
                  {vetInfo.emergency ? '✓ ' : ''}Hitna služba (24/7)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveVetInfo}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Spremanje...' : 'Spremi podatke'}
                </Text>
              </TouchableOpacity>
            </View>

            {vetInfo.phone && (
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color={Colors.primary} />
                <Text style={styles.callButtonText}>Nazovi veterinara</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'notes':
        return (
          <View style={styles.tabContent}>
            <View style={styles.formCard}>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ovdje možete zapisati bilo koje dodatne informacije o svom ljubimcu..."
                placeholderTextColor={Colors.muted}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveNotes}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Spremanje...' : 'Spremi bilješke'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.petAvatar}>
            {pet.photo_url ? (
              <Image source={{ uri: pet.photo_url }} style={styles.petImage} />
            ) : (
              <Text style={styles.petEmoji}>{SPECIES_EMOJI[pet.species]}</Text>
            )}
          </View>
          <View>
            <Text style={styles.headerTitle}>{pet.name}</Text>
            <Text style={styles.headerSubtitle}>
              {pet.breed || SPECIES_LABELS[pet.species]}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="qr-code" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons name={tab.icon as any} size={16} color={isActive ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {renderTabContent()}
      </ScrollView>

      {/* Vaccination Modal */}
      <Modal visible={showVaccinationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo cijepljenje</Text>
              <TouchableOpacity onPress={() => setShowVaccinationModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Naziv cjepiva *</Text>
              <TextInput
                style={styles.formInput}
                value={newVaccination.name}
                onChangeText={(text) => setNewVaccination({ ...newVaccination, name: text })}
                placeholder="npr. Rabies, DHPP, Bordetella..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Datum cijepljenja *</Text>
              <TextInput
                style={styles.formInput}
                value={newVaccination.date}
                onChangeText={(text) => setNewVaccination({ ...newVaccination, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Veterinar</Text>
              <TextInput
                style={styles.formInput}
                value={newVaccination.vet}
                onChangeText={(text) => setNewVaccination({ ...newVaccination, vet: text })}
                placeholder="Ime veterinara ili klinike"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Sljedeće cijepljenje</Text>
              <TextInput
                style={styles.formInput}
                value={newVaccination.next_date}
                onChangeText={(text) => setNewVaccination({ ...newVaccination, next_date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
              />

              <TouchableOpacity style={styles.saveButton} onPress={addVaccination}>
                <Text style={styles.saveButtonText}>Spremi cijepljenje</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Allergy Modal */}
      <Modal visible={showAllergyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova alergija</Text>
              <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Alergen *</Text>
              <TextInput
                style={styles.formInput}
                value={newAllergy.name}
                onChangeText={(text) => setNewAllergy({ ...newAllergy, name: text })}
                placeholder="npr. Piletina, pelud, krpelji..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Ozbiljnost</Text>
              <View style={styles.severityOptions}>
                {(['blaga', 'umjerena', 'ozbiljna'] as const).map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityOption,
                      newAllergy.severity === severity && styles.severityOptionActive,
                    ]}
                    onPress={() => setNewAllergy({ ...newAllergy, severity })}
                  >
                    <Text style={[
                      styles.severityOptionText,
                      newAllergy.severity === severity && styles.severityOptionTextActive,
                    ]}>
                      {ALLERGY_SEVERITY_LABELS[severity]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Bilješke</Text>
              <TextInput
                style={styles.formInput}
                value={newAllergy.notes}
                onChangeText={(text) => setNewAllergy({ ...newAllergy, notes: text })}
                placeholder="Simptomi, liječenje..."
                placeholderTextColor={Colors.muted}
              />

              <TouchableOpacity style={styles.saveButton} onPress={addAllergy}>
                <Text style={styles.saveButtonText}>Spremi alergiju</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Medication Modal */}
      <Modal visible={showMedicationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novi lijek</Text>
              <TouchableOpacity onPress={() => setShowMedicationModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Naziv lijeka *</Text>
              <TextInput
                style={styles.formInput}
                value={newMedication.name}
                onChangeText={(text) => setNewMedication({ ...newMedication, name: text })}
                placeholder="npr. Rimadyl, Frontline..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Doza *</Text>
              <TextInput
                style={styles.formInput}
                value={newMedication.dose}
                onChangeText={(text) => setNewMedication({ ...newMedication, dose: text })}
                placeholder="npr. 1 tableta, 5ml..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Raspored</Text>
              <TextInput
                style={styles.formInput}
                value={newMedication.schedule}
                onChangeText={(text) => setNewMedication({ ...newMedication, schedule: text })}
                placeholder="npr. 2x dnevno, svakih 8h..."
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Početak terapije</Text>
              <TextInput
                style={styles.formInput}
                value={newMedication.start_date}
                onChangeText={(text) => setNewMedication({ ...newMedication, start_date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.formLabel}>Kraj terapije (ostavi prazno ako je kontinuirano)</Text>
              <TextInput
                style={styles.formInput}
                value={newMedication.end_date || ''}
                onChangeText={(text) => setNewMedication({ ...newMedication, end_date: text || null })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
              />

              <TouchableOpacity style={styles.saveButton} onPress={addMedication}>
                <Text style={styles.saveButtonText}>Spremi lijek</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  backLink: {
    color: Colors.primary,
    fontSize: 16,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  petImage: {
    width: 48,
    height: 48,
  },
  petEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: Colors.card,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTab: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Vaccination styles
  vaccinationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vaccinationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  vaccinationName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusValid: {
    backgroundColor: '#DCFCE7',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusExpired: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusValidText: {
    color: '#16A34A',
  },
  statusWarningText: {
    color: '#D97706',
  },
  statusExpiredText: {
    color: '#DC2626',
  },
  vaccinationDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  expiredText: {
    color: Colors.error,
    fontWeight: '500',
  },
  // Allergy styles
  allergyCard: {
    borderRadius: 12,
    padding: 14,
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  allergyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  allergyNotes: {
    fontSize: 13,
    marginTop: 4,
  },
  // Medication styles
  medicationCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 14,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  doseBadge: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  doseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medicationSchedule: {
    fontSize: 13,
    color: '#7C3AED',
    marginBottom: 4,
  },
  medicationDates: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Form styles
  formCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
  },
  emergencyToggle: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  emergencyToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  emergencyToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emergencyToggleTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  callButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  modalBody: {
    padding: 16,
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  severityOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  severityOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  severityOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
