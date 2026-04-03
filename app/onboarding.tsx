import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';
import Button from '../components/Button';
import { useAuth } from '../lib/auth-context';
import { safeUpload } from '../lib/upload';

type Role = 'vlasnik' | 'sitter';

type OwnerPetType = 'pas' | 'mačka' | 'ostalo';
type SitterService = 'šetanje' | 'dnevno čuvanje' | 'noćenje' | 'hranjenje' | 'grooming';

type VerificationDocument = {
  name: string;
  uri: string;
  uploadedUrl?: string;
};

type FormState = {
  role: Role;
  fullName: string;
  city: string;
  petName: string;
  petType: OwnerPetType | '';
  petSize: string;
  hasSpecialNeeds: boolean | null;
  specialNeedsNote: string;
  experience: string;
  services: SitterService[];
  hasYard: boolean | null;
  pricePerHour: string;
  avatarUrl: string;
  verificationNotes: string;
  wantsVerification: boolean;
  verificationDocuments: VerificationDocument[];
};

const TOTAL_STEPS = 5;

const cities = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula'];
const petTypes: { value: OwnerPetType; label: string; emoji: string }[] = [
  { value: 'pas', label: 'Pas', emoji: '🐶' },
  { value: 'mačka', label: 'Mačka', emoji: '🐱' },
  { value: 'ostalo', label: 'Ostalo', emoji: '🐾' },
];
const sitterServices: { value: SitterService; label: string; emoji: string }[] = [
  { value: 'šetanje', label: 'Šetanje', emoji: '🚶' },
  { value: 'dnevno čuvanje', label: 'Dnevno čuvanje', emoji: '🏡' },
  { value: 'noćenje', label: 'Noćenje', emoji: '🌙' },
  { value: 'hranjenje', label: 'Hranjenje', emoji: '🥣' },
  { value: 'grooming', label: 'Grooming', emoji: '✂️' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, skipOnboarding, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    role: (user?.role === 'sitter' ? 'sitter' : 'vlasnik') as Role,
    fullName: user?.name ?? '',
    city: user?.city ?? 'Rijeka',
    petName: '',
    petType: '',
    petSize: '',
    hasSpecialNeeds: null,
    specialNeedsNote: '',
    experience: '',
    services: [],
    hasYard: null,
    pricePerHour: '',
    avatarUrl: '',
    verificationNotes: '',
    wantsVerification: false,
    verificationDocuments: [],
  });

  const progress = useMemo(() => `${step}/${TOTAL_STEPS}`, [step]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Treba dozvola', 'Bez pristupa galeriji ne mogu uzeti avatar. iOS je opet glumio vratara.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateForm('avatarUrl', result.assets[0].uri);
    }
  };

  const pickVerificationDocument = async () => {
    if (form.verificationDocuments.length >= 3) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    updateForm('verificationDocuments', [
      ...form.verificationDocuments,
      {
        name: asset.name || `Dokument ${form.verificationDocuments.length + 1}`,
        uri: asset.uri,
      },
    ]);
  };

  const removeVerificationDocument = (indexToRemove: number) => {
    updateForm(
      'verificationDocuments',
      form.verificationDocuments.filter((_, index) => index !== indexToRemove)
    );
  };

  const toggleService = (service: SitterService) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((item) => item !== service)
        : [...prev.services, service],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.role) {
        Alert.alert('Fali još malo', 'Odaberi kako želiš koristiti PetPark.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!form.fullName.trim() || !form.city.trim()) {
        Alert.alert('Fali još malo', 'Upiši ime i odaberi grad.');
        return false;
      }
      return true;
    }

    if (step === 3 && form.role === 'vlasnik') {
      if (!form.petName.trim() || !form.petType) {
        Alert.alert('Fali još malo', 'Upiši ime ljubimca i odaberi tip.');
        return false;
      }
      return true;
    }

    if (step === 3 && form.role === 'sitter') {
      if (!form.experience.trim()) {
        Alert.alert('Fali još malo', 'Napiši barem kratko iskustvo.');
        return false;
      }
      return true;
    }

    if (step === 4 && form.role === 'vlasnik') {
      return true;
    }

    if (step === 4 && form.role === 'sitter') {
      if (form.services.length === 0 || !form.pricePerHour.trim()) {
        Alert.alert('Fali još malo', 'Odaberi usluge i okvirnu cijenu.');
        return false;
      }
      return true;
    }

    if (step === 5 && form.role === 'sitter') {
      if (form.wantsVerification && !form.verificationNotes.trim()) {
        Alert.alert('Fali još malo', 'Napiši kratku napomenu za verifikaciju ili isključi taj korak za sad.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = form.avatarUrl.trim() || undefined;
      let verificationDocuments = form.verificationDocuments
        .map((item) => item.uploadedUrl)
        .filter((item): item is string => !!item);

      if (user?.id && form.avatarUrl.startsWith('file')) {
        const uploaded = await safeUpload({
          bucket: 'avatars',
          path: `${user.id}/avatar.jpg`,
          uri: form.avatarUrl,
          contentType: 'image/jpeg',
        });
        if (uploaded) avatarUrl = uploaded;
      }

      if (user?.id && form.wantsVerification) {
        const uploadedDocs = await Promise.all(
          form.verificationDocuments.map(async (item, index) => {
            if (!item.uri.startsWith('file')) {
              return item.uploadedUrl ?? item.uri;
            }

            const lower = item.name.toLowerCase();
            const extension = lower.endsWith('.pdf') ? 'pdf' : lower.endsWith('.png') ? 'png' : lower.endsWith('.heic') ? 'heic' : 'jpg';
            const contentTypes: Record<string, string> = { pdf: 'application/pdf', png: 'image/png', heic: 'image/heic', jpg: 'image/jpeg' };

            return safeUpload({
              bucket: 'verification-documents',
              path: `${user.id}/document-${index + 1}.${extension}`,
              uri: item.uri,
              contentType: contentTypes[extension],
            });
          })
        );

        verificationDocuments = uploadedDocs.filter((url): url is string => url !== null);
      }

      await completeOnboarding({
        fullName: form.fullName,
        role: form.role,
        city: form.city,
        onboarding: {
          petName: form.petName,
          petType: form.petType || undefined,
          petSize: form.petSize,
          hasSpecialNeeds: form.hasSpecialNeeds,
          specialNeedsNote: form.specialNeedsNote,
          experience: form.experience,
          services: form.services,
          hasYard: form.hasYard,
          pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
          avatarUrl,
          verificationStatus: form.role === 'sitter' && form.wantsVerification ? 'pending' : 'none',
          verificationNotes: form.verificationNotes.trim() || undefined,
          verificationDocuments,
        },
      });
      Alert.alert(
        'Spremno',
        form.role === 'vlasnik'
          ? 'Profil je spreman. Sad te možemo odmah baciti na pretragu sittera.'
          : 'Profil je spreman. Idemo te ubaciti da izgledaš kao netko kome bi ljudi stvarno povjerili psa.'
      );

      router.replace(form.role === 'vlasnik' ? '/(tabs)/search' : '/(tabs)/profile');
    } catch (error) {
      Alert.alert('Nešto nije uspjelo', 'Spremio sam što mogu lokalno, ali provjeri internet vezu i pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const renderRoleStep = () => (
    <View style={styles.section}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>Kako koristiš PetPark?</Text>
      <Text style={styles.subtitle}>Prvo da ne nagađamo tko si i zašto si tu.</Text>

      <View style={styles.choiceColumn}>
        <TouchableOpacity
          style={[styles.bigChoice, form.role === 'vlasnik' && styles.bigChoiceActive]}
          onPress={() => updateForm('role', 'vlasnik')}
        >
          <Text style={styles.bigChoiceEmoji}>🐶</Text>
          <View style={styles.bigChoiceContent}>
            <Text style={styles.bigChoiceTitle}>Treba mi sitter</Text>
            <Text style={styles.bigChoiceText}>Želim naći nekoga za čuvanje, šetanje ili pomoć oko ljubimca.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigChoice, form.role === 'sitter' && styles.bigChoiceActive]}
          onPress={() => updateForm('role', 'sitter')}
        >
          <Text style={styles.bigChoiceEmoji}>🤝</Text>
          <View style={styles.bigChoiceContent}>
            <Text style={styles.bigChoiceTitle}>Želim biti sitter</Text>
            <Text style={styles.bigChoiceText}>Želim nuditi usluge i dobivati upite od vlasnika ljubimaca.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBasicsStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Osnovni podaci</Text>
      <Text style={styles.subtitle}>Ništa dramatično, samo da profil ne izgleda kao witness protection program.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ime i prezime</Text>
        <TextInput
          style={styles.input}
          placeholder="Kako da te zovemo?"
          placeholderTextColor={Colors.muted}
          value={form.fullName}
          onChangeText={(value) => updateForm('fullName', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Grad</Text>
        <View style={styles.chipWrap}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.chip, form.city === city && styles.chipActive]}
              onPress={() => updateForm('city', city)}
            >
              <Text style={[styles.chipText, form.city === city && styles.chipTextActive]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderOwnerPetStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Reci nešto o ljubimcu</Text>
      <Text style={styles.subtitle}>Što više znaš upfront, manje kasnije ide ono “a usput, grize usisavač i poštara”.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ime ljubimca</Text>
        <TextInput
          style={styles.input}
          placeholder="Npr. Maza"
          placeholderTextColor={Colors.muted}
          value={form.petName}
          onChangeText={(value) => updateForm('petName', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tip ljubimca</Text>
        <View style={styles.optionRow}>
          {petTypes.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.optionCard, form.petType === item.value && styles.optionCardActive]}
              onPress={() => updateForm('petType', item.value)}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text style={[styles.optionLabel, form.petType === item.value && styles.optionLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Veličina / napomena</Text>
        <TextInput
          style={styles.input}
          placeholder="Mali, srednji, veliki..."
          placeholderTextColor={Colors.muted}
          value={form.petSize}
          onChangeText={(value) => updateForm('petSize', value)}
        />
      </View>
    </View>
  );

  const renderOwnerNeedsStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Posebne potrebe?</Text>
      <Text style={styles.subtitle}>Ovdje hvataš bitne stvari prije nego krene matchmaking, kao Tinder ali s manje red flagova i više povodaca.</Text>

      <View style={styles.binaryRow}>
        <TouchableOpacity
          style={[styles.binaryButton, form.hasSpecialNeeds === true && styles.binaryButtonActive]}
          onPress={() => updateForm('hasSpecialNeeds', true)}
        >
          <Text style={[styles.binaryText, form.hasSpecialNeeds === true && styles.binaryTextActive]}>Da</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.binaryButton, form.hasSpecialNeeds === false && styles.binaryButtonActive]}
          onPress={() => updateForm('hasSpecialNeeds', false)}
        >
          <Text style={[styles.binaryText, form.hasSpecialNeeds === false && styles.binaryTextActive]}>Ne</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dodatna napomena</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Lijekovi, strahovi, rutina, što god sitter treba znati"
          placeholderTextColor={Colors.muted}
          multiline
          value={form.specialNeedsNote}
          onChangeText={(value) => updateForm('specialNeedsNote', value)}
        />
      </View>
    </View>
  );

  const renderSitterExperienceStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Tko si ti u pet svijetu?</Text>
      <Text style={styles.subtitle}>Treba nam kratki pitch, ne roman od Tolstoja.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Iskustvo</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Npr. Čuvam pse 3 godine, imam iskustva s većim pasminama..."
          placeholderTextColor={Colors.muted}
          multiline
          value={form.experience}
          onChangeText={(value) => updateForm('experience', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Imaš dvorište?</Text>
        <View style={styles.binaryRow}>
          <TouchableOpacity
            style={[styles.binaryButton, form.hasYard === true && styles.binaryButtonActive]}
            onPress={() => updateForm('hasYard', true)}
          >
            <Text style={[styles.binaryText, form.hasYard === true && styles.binaryTextActive]}>Da</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.binaryButton, form.hasYard === false && styles.binaryButtonActive]}
            onPress={() => updateForm('hasYard', false)}
          >
            <Text style={[styles.binaryText, form.hasYard === false && styles.binaryTextActive]}>Ne</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSitterServicesStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Što nudiš?</Text>
      <Text style={styles.subtitle}>Ovdje se prodaješ. Bez krinđa, ali jasno.</Text>

      <View style={styles.chipWrap}>
        {sitterServices.map((service) => {
          const active = form.services.includes(service.value);
          return (
            <TouchableOpacity
              key={service.value}
              style={[styles.serviceChip, active && styles.serviceChipActive]}
              onPress={() => toggleService(service.value)}
            >
              <Text style={styles.serviceEmoji}>{service.emoji}</Text>
              <Text style={[styles.serviceText, active && styles.serviceTextActive]}>{service.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cijena po satu (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="Npr. 10"
          placeholderTextColor={Colors.muted}
          keyboardType="numeric"
          value={form.pricePerHour}
          onChangeText={(value) => updateForm('pricePerHour', value.replace(/[^0-9]/g, ''))}
        />
      </View>
    </View>
  );

  const renderSitterTrustStep = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Povjerenje i profil</Text>
      <Text style={styles.subtitle}>App Store voli profile koji izgledaju kao stvarni ljudi, a ne random NPC iz side questa.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avatar</Text>
        <TouchableOpacity style={styles.uploadCard} onPress={pickAvatar}>
          {form.avatarUrl ? (
            <Image source={{ uri: form.avatarUrl }} style={styles.avatarPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={26} color={Colors.primary} />
            </View>
          )}
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>{form.avatarUrl ? 'Promijeni avatar' : 'Dodaj avatar'}</Text>
            <Text style={styles.uploadSubtitle}>Kvadratna fotka, bez mutnih FBI screenshotova.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Želiš poslati profil na verifikaciju?</Text>
        <View style={styles.binaryRow}>
          <TouchableOpacity
            style={[styles.binaryButton, form.wantsVerification === true && styles.binaryButtonActive]}
            onPress={() => updateForm('wantsVerification', true)}
          >
            <Text style={[styles.binaryText, form.wantsVerification === true && styles.binaryTextActive]}>Da</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.binaryButton, form.wantsVerification === false && styles.binaryButtonActive]}
            onPress={() => updateForm('wantsVerification', false)}
          >
            <Text style={[styles.binaryText, form.wantsVerification === false && styles.binaryTextActive]}>Kasnije</Text>
          </TouchableOpacity>
        </View>
      </View>

      {form.wantsVerification ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Napomena za verifikaciju</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Npr. imam obrt, iskustvo 4 godine, dokumente šaljem u idućem koraku admin provjere"
              placeholderTextColor={Colors.muted}
              multiline
              value={form.verificationNotes}
              onChangeText={(value) => updateForm('verificationNotes', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inlineHeader}>
              <Text style={styles.label}>Dokumenti za verifikaciju</Text>
              <TouchableOpacity onPress={pickVerificationDocument} disabled={form.verificationDocuments.length >= 3}>
                <Text style={styles.addDocText}>+ Dodaj</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.docList}>
              {form.verificationDocuments.length === 0 ? (
                <Text style={styles.helperText}>Dodaj do 3 slike ili PDF-a za verifikaciju.</Text>
              ) : (
                form.verificationDocuments.map((doc, index) => (
                  <View key={`${doc.name}-${index}`} style={styles.docCard}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                    <View style={styles.docCopy}>
                      <Text style={styles.docTitle}>{doc.name}</Text>
                      <Text style={styles.docSubtitle}>{doc.name.toLowerCase().endsWith('.pdf') ? 'PDF dokument' : 'Slika dokumenta'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeVerificationDocument(index)}>
                      <Ionicons name="close-circle" size={22} color={Colors.muted} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        </>
      ) : null}
    </View>
  );

  const renderStep = () => {
    if (step === 1) return renderRoleStep();
    if (step === 2) return renderBasicsStep();
    if (step === 3) return form.role === 'vlasnik' ? renderOwnerPetStep() : renderSitterExperienceStep();
    if (step === 4) return form.role === 'vlasnik' ? renderOwnerNeedsStep() : renderSitterServicesStep();
    if (form.role === 'sitter') return renderSitterTrustStep();

    return (
      <View style={styles.section}>
        <Text style={styles.title}>To je to</Text>
        <Text style={styles.subtitle}>Još jedan klik i možemo te pustiti dalje bez dodatnog gnjavažnog ceremonijala.</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Korak {progress}</Text>
          </View>
        </View>

        {renderStep()}

        <View style={styles.footer}>
          <Button
            title={loading ? 'Spremanje...' : step === TOTAL_STEPS ? 'Završi onboarding' : 'Dalje'}
            onPress={handleNext}
            size="large"
            style={styles.primaryButton}
            disabled={loading}
          />
          {step < TOTAL_STEPS ? (
            <TouchableOpacity onPress={() => { skipOnboarding(); router.replace('/(tabs)'); }}>
              <Text style={styles.skipText}>Preskoči za sad</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    gap: 20,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  choiceColumn: {
    gap: 14,
  },
  bigChoice: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  bigChoiceActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  bigChoiceEmoji: {
    fontSize: 28,
  },
  bigChoiceContent: {
    flex: 1,
    gap: 4,
  },
  bigChoiceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  bigChoiceText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  optionLabelActive: {
    color: Colors.primary,
  },
  binaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  binaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  binaryButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  binaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  binaryTextActive: {
    color: Colors.primary,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  uploadPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.border,
  },
  uploadCopy: {
    flex: 1,
    gap: 4,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addDocText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  docList: {
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  docCopy: {
    flex: 1,
    gap: 2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  docSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  serviceChipActive: {
    backgroundColor: Colors.primary,
  },
  serviceEmoji: {
    fontSize: 16,
  },
  serviceText: {
    fontWeight: '700',
    color: Colors.text,
  },
  serviceTextActive: {
    color: Colors.white,
  },
  footer: {
    marginTop: 32,
    gap: 14,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
