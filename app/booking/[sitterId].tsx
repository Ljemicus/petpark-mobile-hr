import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import type {
  ServiceType,
  BookingStep,
  SitterInfo,
  PetInfo,
} from '../../lib/booking-types';
import {
  SERVICE_LABELS,
  SERVICE_EMOJI,
  SERVICE_DESCRIPTIONS,
  BOOKING_STEPS,
  calculateBookingPrice,
} from '../../lib/booking-types';
import {
  getSitterForBooking,
  getSitterPrices,
  getOwnerPets,
  checkSitterAvailability,
  createBooking,
} from '../../lib/booking-db';

// Step indicator komponenta
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepIndicator}>
      {BOOKING_STEPS.map((step: BookingStep, index: number) => {
        const isCompleted = currentStep > step.step;
        const isCurrent = currentStep === step.step;
        const isUpcoming = currentStep < step.step;

        return (
          <React.Fragment key={step.step}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                  isUpcoming && styles.stepCircleUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                      isUpcoming && styles.stepNumberUpcoming,
                    ]}
                  >
                    {step.step}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  isCompleted && styles.stepTitleCompleted,
                  isCurrent && styles.stepTitleCurrent,
                  isUpcoming && styles.stepTitleUpcoming,
                ]}
                numberOfLines={1}
              >
                {step.title}
              </Text>
            </View>
            {index < BOOKING_STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Service selection komponenta
function ServiceSelection({
  selectedService,
  onSelectService,
  availableServices,
  sitterPrices,
}: {
  selectedService: ServiceType | null;
  onSelectService: (service: ServiceType) => void;
  availableServices: ServiceType[];
  sitterPrices: Record<ServiceType, number> | null;
}) {
  const allServices: ServiceType[] = ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'];

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Odaberite uslugu</Text>
      <Text style={styles.stepSubheading}>
        Izaberite vrstu usluge koju želite rezervirati
      </Text>

      <View style={styles.servicesGrid}>
        {allServices.map((service) => {
          const isAvailable = availableServices.includes(service);
          const isSelected = selectedService === service;
          const price = sitterPrices?.[service];

          return (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceCard,
                isSelected && styles.serviceCardSelected,
                !isAvailable && styles.serviceCardDisabled,
              ]}
              onPress={() => isAvailable && onSelectService(service)}
              disabled={!isAvailable}
              activeOpacity={0.8}
            >
              <Text style={styles.serviceEmoji}>{SERVICE_EMOJI[service]}</Text>
              <Text style={[styles.serviceName, !isAvailable && styles.serviceNameDisabled]}>
                {SERVICE_LABELS[service]}
              </Text>
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {SERVICE_DESCRIPTIONS[service]}
              </Text>
              {isAvailable ? (
                <Text style={styles.servicePrice}>
                  {price ? `${price}€/dan` : 'Cijena na upit'}
                </Text>
              ) : (
                <Text style={styles.serviceUnavailable}>Nije dostupno</Text>
              )}
              {isSelected && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Date selection komponenta
function DateSelection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  serviceType,
  pricePerDay,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  serviceType: ServiceType;
  pricePerDay: number;
}) {
  const price = calculateBookingPrice(serviceType, startDate, endDate, pricePerDay);

  // Generiraj opcije za datume
  const generateDateOptions = () => {
    const options: string[] = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      options.push(date.toISOString().split('T')[0]);
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Odaberite datume</Text>
      <Text style={styles.stepSubheading}>
        Odaberite kada želite rezervirati uslugu
      </Text>

      <View style={styles.dateSection}>
        <Text style={styles.dateLabel}>Datum početka</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dateOptions.map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateOption,
                startDate === date && styles.dateOptionSelected,
              ]}
              onPress={() => {
                onStartDateChange(date);
                // Ako je endDate prije novog startDate, postavi endDate na startDate
                if (endDate < date) {
                  onEndDateChange(date);
                }
              }}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  startDate === date && styles.dateOptionTextSelected,
                ]}
              >
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.dateLabel}>Datum završetka</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dateOptions
            .filter((date) => date >= startDate)
            .map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateOption,
                  endDate === date && styles.dateOptionSelected,
                ]}
                onPress={() => onEndDateChange(date)}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    endDate === date && styles.dateOptionTextSelected,
                  ]}
                >
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {price.days > 0 && (
        <View style={styles.pricePreview}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelPreview}>Broj dana</Text>
            <Text style={styles.priceValuePreview}>{price.days}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabelPreview}>Cijena po danu</Text>
            <Text style={styles.priceValuePreview}>{pricePerDay}€</Text>
          </View>
          <View style={[styles.priceRow, styles.priceRowTotal]}>
            <Text style={styles.priceLabelTotal}>Ukupno</Text>
            <Text style={styles.priceValueTotal}>{price.total.toFixed(2)}€</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Pet selection komponenta
function PetSelection({
  pets,
  selectedPetId,
  onSelectPet,
  onAddNewPet,
  onViewPassport,
}: {
  pets: PetInfo[];
  selectedPetId: string | null;
  onSelectPet: (petId: string) => void;
  onAddNewPet: () => void;
  onViewPassport: (petId: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Odaberite ljubimca</Text>
      <Text style={styles.stepSubheading}>
        Izaberite ljubimca za kojeg želite rezervirati uslugu
      </Text>

      {pets.length === 0 ? (
        <View style={styles.emptyPets}>
          <Ionicons name="paw-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyPetsTitle}>Nemate dodanih ljubimaca</Text>
          <Text style={styles.emptyPetsText}>
            Morate dodati ljubimca prije nego što možete napraviti rezervaciju
          </Text>
          <TouchableOpacity style={styles.addPetButton} onPress={onAddNewPet}>
            <Text style={styles.addPetButtonText}>Dodaj ljubimca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.petsList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petCard,
                selectedPetId === pet.id && styles.petCardSelected,
              ]}
              onPress={() => onSelectPet(pet.id)}
              activeOpacity={0.8}
            >
              <View style={styles.petAvatar}>
                {pet.photo_url ? (
                  <Text style={styles.petPhoto}>{pet.photo_url}</Text>
                ) : (
                  <Ionicons
                    name={pet.species === 'cat' ? 'logo-octocat' : 'paw'}
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>
                  {pet.species === 'dog' ? 'Pas' : pet.species === 'cat' ? 'Mačka' : 'Ostalo'}
                  {pet.breed ? ` • ${pet.breed}` : ''}
                </Text>
                <TouchableOpacity
                  style={styles.viewPassportLink}
                  onPress={() => onViewPassport(pet.id)}
                >
                  <Text style={styles.viewPassportText}>Pogledaj passport ↗</Text>
                </TouchableOpacity>
              </View>
              {selectedPetId === pet.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addNewPetCard} onPress={onAddNewPet}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.addNewPetText}>Dodaj novog ljubimca</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Note input komponenta
function NoteInput({
  note,
  onChangeNote,
}: {
  note: string;
  onChangeNote: (note: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Dodatne napomene</Text>
      <Text style={styles.stepSubheading}>
        Napišite bilo koje posebne zahtjeve ili napomene za čuvara
      </Text>

      <View style={styles.noteContainer}>
        <TextInput
          style={styles.noteInput}
          multiline
          numberOfLines={6}
          placeholder="Npr. Moj pas treba posebnu hranu, voli igrati s lopticama..."
          placeholderTextColor={Colors.muted}
          value={note}
          onChangeText={onChangeNote}
          textAlignVertical="top"
        />
        <Text style={styles.noteHint}>
          {note.length}/500 znakova
        </Text>
      </View>

      <View style={styles.noteTips}>
        <Text style={styles.noteTipsTitle}>Savjeti za napomene:</Text>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.tipText}>Posebne prehrambene potrebe</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.tipText}>Liječenje ili vitamini</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.tipText}>Omiljene igračke ili aktivnosti</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.tipText}>Navike u šetnji ili spavanju</Text>
        </View>
      </View>
    </View>
  );
}

// Review komponenta
function ReviewStep({
  serviceType,
  startDate,
  endDate,
  pet,
  sitter,
  note,
  price,
}: {
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  pet: PetInfo | null;
  sitter: SitterInfo | null;
  note: string;
  price: { total: number; platformFee: number; sitterPayout: number; days: number };
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Pregled rezervacije</Text>
      <Text style={styles.stepSubheading}>
        Provjerite sve podatke prije slanja upita
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Čuvar</Text>
          <View style={styles.reviewRow}>
            <Ionicons name="person" size={16} color={Colors.primary} />
            <Text style={styles.reviewValue}>{sitter?.name || 'Nepoznato'}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.reviewValue}>{sitter?.city || 'Nepoznato'}</Text>
          </View>
        </View>

        <View style={styles.reviewDivider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Usluga</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewEmoji}>{SERVICE_EMOJI[serviceType]}</Text>
            <Text style={styles.reviewValue}>{SERVICE_LABELS[serviceType]}</Text>
          </View>
        </View>

        <View style={styles.reviewDivider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Datumi</Text>
          <View style={styles.reviewRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.reviewValue}>Od: {formatDate(startDate)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.reviewValue}>Do: {formatDate(endDate)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="time" size={16} color={Colors.textSecondary} />
            <Text style={styles.reviewValue}>Broj dana: {price.days}</Text>
          </View>
        </View>

        <View style={styles.reviewDivider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Ljubimac</Text>
          <View style={styles.reviewRow}>
            <Ionicons name="paw" size={16} color={Colors.primary} />
            <Text style={styles.reviewValue}>{pet?.name || 'Nepoznato'}</Text>
          </View>
        </View>

        {note && (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Napomene</Text>
              <Text style={styles.reviewNote}>{note}</Text>
            </View>
          </>
        )}

        <View style={styles.reviewDivider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Cijena</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceBreakdownRow}>
              <Text style={styles.priceBreakdownLabel}>Osnovna cijena</Text>
              <Text style={styles.priceBreakdownValue}>{price.total.toFixed(2)}€</Text>
            </View>
            <View style={styles.priceBreakdownRow}>
              <Text style={styles.priceBreakdownLabel}>Naknada platforme (10%)</Text>
              <Text style={styles.priceBreakdownValue}>{price.platformFee.toFixed(2)}€</Text>
            </View>
            <View style={styles.priceBreakdownRow}>
              <Text style={styles.priceBreakdownLabel}>Čuvar prima</Text>
              <Text style={styles.priceBreakdownValue}>{price.sitterPayout.toFixed(2)}€</Text>
            </View>
            <View style={styles.priceBreakdownTotal}>
              <Text style={styles.priceBreakdownTotalLabel}>UKUPNO</Text>
              <Text style={styles.priceBreakdownTotalValue}>{price.total.toFixed(2)}€</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.noticeBox}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.noticeText}>
          Nakon slanja upita, čuvar će ga pregledati i prihvatiti ili odbiti. 
          Plaćanje će biti dostupno nakon što čuvar prihvati rezervaciju.
        </Text>
      </View>
    </View>
  );
}

// Main komponenta
export default function BookingScreen() {
  const { sitterId } = useLocalSearchParams<{ sitterId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sitter, setSitter] = useState<SitterInfo | null>(null);
  const [sitterPrices, setSitterPrices] = useState<Record<ServiceType, number> | null>(null);
  const [pets, setPets] = useState<PetInfo[]>([]);

  // Form state
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  // Initialize
  useEffect(() => {
    loadData();
  }, [sitterId]);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sitterData, pricesData, petsData] = await Promise.all([
        getSitterForBooking(sitterId!),
        getSitterPrices(sitterId!),
        user ? getOwnerPets(user.id) : Promise.resolve([]),
      ]);

      setSitter(sitterData);
      setSitterPrices(pricesData);
      setPets(petsData);
    } catch (err) {
      console.error('Error loading booking data:', err);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedService) {
      Alert.alert('Upozorenje', 'Molimo odaberite uslugu');
      return;
    }
    if (currentStep === 3 && !selectedPetId) {
      Alert.alert('Upozorenje', 'Molimo odaberite ljubimca');
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Prijava obavezna', 'Morate se prijaviti za rezervaciju', [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Prijavi se', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!selectedService || !selectedPetId) {
      Alert.alert('Greška', 'Nedostaju podaci za rezervaciju');
      return;
    }

    try {
      setSubmitting(true);

      // Provjeri dostupnost
      const isAvailable = await checkSitterAvailability(sitterId!, startDate, endDate);
      if (!isAvailable) {
        Alert.alert(
          'Sitter nije dostupan',
          'Odabrani datumi nisu dostupni. Molimo odaberite druge datume.'
        );
        setSubmitting(false);
        return;
      }

      // Kreiraj booking
      const pricePerDay = sitterPrices?.[selectedService] || 25;
      const booking = await createBooking(user.id, {
        sitter_id: sitterId!,
        pet_id: selectedPetId,
        service_type: selectedService,
        start_date: startDate,
        end_date: endDate,
        note: note || undefined,
      }, pricePerDay);

      if (booking) {
        router.replace({
          pathname: '/booking/confirmation',
          params: {
            bookingId: booking.id,
            status: 'success',
          },
        });
      } else {
        Alert.alert('Greška', 'Došlo je do greške pri kreiranju rezervacije');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      Alert.alert('Greška', 'Došlo je do greške pri kreiranju rezervacije');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNewPet = () => {
    Alert.alert(
      'Dodaj ljubimca',
      'Želite li dodati novog ljubimca?',
      [
        { text: 'Ne sada', style: 'cancel' },
        { text: 'Dodaj', onPress: () => router.push('/dashboard/owner/pets') },
      ]
    );
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId) || null;
  const price = selectedService
    ? calculateBookingPrice(
        selectedService,
        startDate,
        endDate,
        sitterPrices?.[selectedService] || 25
      )
    : { total: 0, platformFee: 0, sitterPayout: 0, days: 0 };

  const availableServices = sitter?.services || [];
  const currentStepData = BOOKING_STEPS.find((s: BookingStep) => s.step === currentStep);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nova rezervacija</Text>
          {sitter && (
            <Text style={styles.headerSubtitle}>{sitter.name}</Text>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <StepIndicator currentStep={currentStep} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && (
            <ServiceSelection
              selectedService={selectedService}
              onSelectService={setSelectedService}
              availableServices={availableServices}
              sitterPrices={sitterPrices}
            />
          )}

          {currentStep === 2 && selectedService && (
            <DateSelection
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              serviceType={selectedService}
              pricePerDay={sitterPrices?.[selectedService] || 25}
            />
          )}

          {currentStep === 3 && (
            <PetSelection
              pets={pets}
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
              onAddNewPet={handleAddNewPet}
              onViewPassport={(petId: string) => router.push(`/pet-passport/${petId}`)}
            />
          )}

          {currentStep === 4 && (
            <NoteInput note={note} onChangeNote={setNote} />
          )}

          {currentStep === 5 && selectedService && (
            <ReviewStep
              serviceType={selectedService}
              startDate={startDate}
              endDate={endDate}
              pet={selectedPet}
              sitter={sitter}
              note={note}
              price={price}
            />
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.progressDots}>
          {BOOKING_STEPS.map((s: BookingStep) => (
            <View
              key={s.step}
              style={[
                styles.progressDot,
                currentStep === s.step && styles.progressDotActive,
                currentStep > s.step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBack}
              disabled={submitting}
            >
              <Text style={styles.buttonSecondaryText}>Natrag</Text>
            </TouchableOpacity>
          )}

          {currentStep < 5 ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                currentStep === 1 && !selectedService && styles.buttonDisabled,
                currentStep === 3 && !selectedPetId && styles.buttonDisabled,
              ]}
              onPress={handleNext}
              disabled={
                (currentStep === 1 && !selectedService) ||
                (currentStep === 3 && !selectedPetId)
              }
            >
              <Text style={styles.buttonPrimaryText}>Naprijed</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonPrimaryText}>Pošalji upit</Text>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleUpcoming: {
    backgroundColor: Colors.background,
    borderColor: Colors.muted,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
  },
  stepNumberCurrent: {
    color: '#FFFFFF',
  },
  stepNumberUpcoming: {
    color: Colors.muted,
  },
  stepTitle: {
    fontSize: 10,
    marginTop: 4,
    color: Colors.muted,
    maxWidth: 60,
    textAlign: 'center',
  },
  stepTitleCompleted: {
    color: Colors.success,
  },
  stepTitleCurrent: {
    color: Colors.primary,
    fontWeight: '600',
  },
  stepTitleUpcoming: {
    color: Colors.muted,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },

  // Step content
  stepContent: {
    padding: 20,
  },
  stepHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },

  // Service selection
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  serviceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF7ED',
  },
  serviceCardDisabled: {
    opacity: 0.5,
  },
  serviceEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceNameDisabled: {
    color: Colors.muted,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  serviceUnavailable: {
    fontSize: 13,
    color: Colors.muted,
    fontStyle: 'italic',
  },
  selectedCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // Date selection
  dateSection: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  dateScroll: {
    flexGrow: 0,
  },
  dateScrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateOptionText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    color: '#FFFFFF',
  },
  pricePreview: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceRowTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceLabelPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValuePreview: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  priceLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  priceValueTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Pet selection
  petsList: {
    gap: 12,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF7ED',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  petPhoto: {
    fontSize: 10,
    color: Colors.muted,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  petBreed: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewPassportLink: {
    marginTop: 4,
  },
  viewPassportText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyPets: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPetsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
  emptyPetsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
  },
  addPetButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addNewPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  addNewPetText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Note input
  noteContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  noteInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 22,
  },
  noteHint: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  noteTips: {
    marginTop: 24,
  },
  noteTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Review step
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
  },
  reviewSection: {
    marginBottom: 4,
  },
  reviewSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  reviewValue: {
    fontSize: 15,
    color: Colors.text,
  },
  reviewEmoji: {
    fontSize: 20,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  reviewNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  priceBreakdown: {
    gap: 8,
  },
  priceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceBreakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceBreakdownValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  priceBreakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  priceBreakdownTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  priceBreakdownTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Bottom buttons
  bottomContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: Colors.success,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
