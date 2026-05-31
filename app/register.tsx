import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';
import { useAuth } from '../lib/auth-context';
import Button from '../components/Button';
import PetParkLogo from '../components/PetParkLogo';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'vlasnik' | 'sitter'>('vlasnik');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Greška', 'Popunite sva polja.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Greška', 'Lozinka mora imati minimalno 8 znakova.');
      return;
    }
    setLoading(true);
    const { success, error } = await register(email, password, name, role);
    setLoading(false);
    if (success) {
      router.replace('/onboarding');
    } else if (error) {
      Alert.alert('Greška', error);
    }
  };

  const handleSocialRegister = () => {
    Alert.alert('Uskoro', 'Prijava putem društvenih mreža dolazi uskoro.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PetParkLogo width={190} style={styles.logo} />
        <Text style={styles.title}>Registracija</Text>
        <Text style={styles.subtitle}>Kreirajte svoj PetPark račun</Text>

        {/* Role selection */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleOption, role === 'vlasnik' && styles.roleActive]}
            onPress={() => setRole('vlasnik')}
          >
            <Text style={styles.roleEmoji}>🐕</Text>
            <Text style={[styles.roleText, role === 'vlasnik' && styles.roleTextActive]}>Vlasnik</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, role === 'sitter' && styles.roleActive]}
            onPress={() => setRole('sitter')}
          >
            <Text style={styles.roleEmoji}>🤝</Text>
            <Text style={[styles.roleText, role === 'sitter' && styles.roleTextActive]}>Sitter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ime i prezime</Text>
            <TextInput
              style={styles.input}
              placeholder="Vaše ime"
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="vas@email.com"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lozinka</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimalno 8 znakova"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button title={loading ? 'Registracija...' : 'Registriraj se'} onPress={handleRegister} size="large" style={{ width: '100%', marginTop: 8 }} />
        </View>

        <View style={styles.socialDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ili</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={handleSocialRegister}>
            <Ionicons name="logo-apple" size={22} color={Colors.text} />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleSocialRegister}>
            <Ionicons name="logo-google" size={22} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleSocialRegister}>
            <Ionicons name="logo-facebook" size={22} color="#4267B2" />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/login')}>
          <Text style={styles.loginText}>Već imate račun? <Text style={styles.loginBold}>Prijavite se</Text></Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    alignItems: 'center',
  },
  logo: {
    marginTop: 20,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.primary,
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: Colors.muted,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  loginLink: {
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
});
