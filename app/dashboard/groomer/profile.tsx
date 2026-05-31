// Groomer Profile Screen
// Uređivanje profila groomera

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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { GroomerProfile, GroomingServiceType, GroomerSpecialization } from '../../../lib/groomer-dashboard-types';
import {
  GROOMING_SERVICE_LABELS,
  GROOMER_SPECIALIZATION_LABELS,
  CITIES,
} from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  updateGroomerProfile,
} from '../../../lib/groomer-dashboard-db';

const SPECIALIZATIONS: GroomerSpecialization[] = ['psi', 'macke', 'oba'];
const SERVICES: GroomingServiceType[] = ['sisanje', 'kupanje', 'trimanje', 'nokti', 'cetkanje'];

export default function GroomerProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    bio: '',
    city: '',
    phone: '',
    email: '',
    address: '',
    specialization: 'oba' as GroomerSpecialization,
    services: [] as GroomingServiceType[],
    prices: {} as Record<GroomingServiceType, number>,
  });

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        setForm({
          name: profileData.name || '',
          bio: profileData.bio || '',
          city: profileData.city || '',
          phone: profileData.phone || '',
          email: profileData.email || '',
          address: profileData.address || '',
          specialization: profileData.specialization || 'oba',
          services: profileData.services || [],
          prices: profileData.prices || {},
        });
      } else {
        setIsNewProfile(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleToggleService = (service: GroomingServiceType) => {
    setForm((prev) => {
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      
      const prices = { ...prev.prices };
      if (!services.includes(service)) {
        delete prices[service];
      }
      
      return { ...prev, services, prices };
    });
  };

  const handlePriceChange = (service: GroomingServiceType, price: string) => {
    const numPrice = parseInt(price) || 0;
    setForm((prev) => ({
      ...prev,
      prices: { ...prev.prices, [service]: numPrice },
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      Alert.alert('Greška', 'Ime mora imati najmanje 2 znaka');
      return;
    }
    if (form.services.length === 0) {
      Alert.alert('Greška', 'Odaberite barem jednu uslugu');
      return;
    }
    if (!form.city) {
      Alert.alert('Greška', 'Odaberite grad');
      return;
    }

    setSaving(true);
    try {
      if (isNewProfile) {
        // Create new profile
        const { supabase } = await import('../../../lib/supabase');
        const { data, error } = await supabase
          .from('groomers')
          .insert({
            user_id: userId,
            ...form,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        Alert.alert('Uspjeh', 'Profil je kreiran!');
        setIsNewProfile(false);
        setProfile(data);
      } else if (profile) {
        // Update existing profile
        const success = await updateGroomerProfile(profile.id, form);
        if (success) {
          Alert.alert('Uspjeh', 'Profil je ažuriran!');
          await fetchData();
        } else {
          Alert.alert('Greška', 'Nije moguće spremiti profil');
        }
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Greška', 'Došlo je do pogreške pri spremanju profila');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isNewProfile ? 'Kreiraj profil' : 'Uredi profil'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Osnovni podaci</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ime / Naziv salona *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                placeholder="Vaše ime ili naziv salona"
                placeholderTextColor={Colors.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.bio}
                onChangeText={(text) => setForm((prev) => ({ ...prev, bio: text }))}
                placeholder="Opišite svoje iskustvo i usluge..."
                placeholderTextColor={Colors.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grad *</Text>
              <View style={styles.selectContainer}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityChip, form.city === city && styles.cityChipActive]}
                    onPress={() => setForm((prev) => ({ ...prev, city }))}
                  >
                    <Text style={[styles.cityChipText, form.city === city && styles.cityChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresa</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
                placeholder="Ulica i broj, grad"
                placeholderTextColor={Colors.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                placeholder="+385 91 234 5678"
                placeholderTextColor={Colors.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                placeholder="email@primjer.hr"
                placeholderTextColor={Colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Specialization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specijalizacija</Text>
          <View style={styles.card}>
            <View style={styles.specializationContainer}>
              {SPECIALIZATIONS.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.specChip,
                    form.specialization === spec && styles.specChipActive,
                  ]}
                  onPress={() => setForm((prev) => ({ ...prev, specialization: spec }))}
                >
                  <Text
                    style={[
                      styles.specChipText,
                      form.specialization === spec && styles.specChipTextActive,
                    ]}
                  >
                    {GROOMER_SPECIALIZATION_LABELS[spec]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usluge i cijene *</Text>
          <View style={styles.card}>
            {SERVICES.map((service) => (
              <View key={service} style={styles.serviceRow}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceToggle}>
                    <Switch
                      value={form.services.includes(service)}
                      onValueChange={() => handleToggleService(service)}
                      trackColor={{ false: '#E5E7EB', true: `${Colors.primary}50` }}
                      thumbColor={form.services.includes(service) ? Colors.primary : '#FFF'}
                    />
                    <Text style={styles.serviceName}>
                      {GROOMING_SERVICE_LABELS[service]}
                    </Text>
                  </View>
                  {form.services.includes(service) && (
                    <View style={styles.priceInputContainer}>
                      <TextInput
                        style={styles.priceInput}
                        value={form.prices[service]?.toString() || ''}
                        onChangeText={(text) => handlePriceChange(service, text)}
                        placeholder="0"
                        placeholderTextColor={Colors.muted}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.priceCurrency}>€</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Verification Badge */}
        {profile?.verified && (
          <View style={styles.verifiedCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.verifiedInfo}>
              <Text style={styles.verifiedTitle}>Verificiran profil</Text>
              <Text style={styles.verifiedSubtitle}>
                Vaš profil je verificiran od strane PetPark tima
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Ionicons name="refresh" size={24} color="#FFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>
                {isNewProfile ? 'Kreiraj profil' : 'Spremi promjene'}
              </Text>
            </>
          )}
        </TouchableOpacity>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  cityChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  specializationContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  specChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  specChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  specChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  serviceRow: {
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 15,
    color: Colors.text,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceInput: {
    width: 70,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceCurrency: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  verifiedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  verifiedSubtitle: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
