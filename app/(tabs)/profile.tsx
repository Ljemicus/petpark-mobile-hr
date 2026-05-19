import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import Button from '../../components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, session, isLoggedIn, logout, needsOnboarding } = useAuth();
  const meta = session?.user?.user_metadata ?? {};
  const onboarding = (meta.onboarding ?? {}) as Record<string, any>;
  const verificationStatus = (meta.verification_status ?? onboarding.verificationStatus ?? 'none') as string;
  const verificationNotes = (onboarding.verificationNotes ?? '') as string;
  const verificationDocs = (onboarding.verificationDocuments ?? []) as string[];
  const onboardingCompleted = !needsOnboarding;

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <Text style={styles.guestEmoji}>🐾</Text>
          <Text style={styles.guestTitle}>Dobrodošli u PetPark!</Text>
          <Text style={styles.guestSubtitle}>Prijavite se za pristup svim funkcionalnostima</Text>

          <View style={styles.authButtons}>
            <Button title="Prijavi se" onPress={() => router.push('/login')} size="large" style={styles.fullWidth} />
            <Button title="Registriraj se" onPress={() => router.push('/register')} variant="outline" size="large" style={styles.fullWidth} />
          </View>

          <View style={styles.socialDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ili nastavi s</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Uskoro', 'Prijava putem društvenih mreža dolazi uskoro.')}>
              <Ionicons name="logo-apple" size={24} color={Colors.text} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Uskoro', 'Prijava putem društvenih mreža dolazi uskoro.')}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Uskoro', 'Prijava putem društvenih mreža dolazi uskoro.')}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const isProvider = user!.role === 'sitter' || user!.role === 'oboje';
  const menuItems = [
    { icon: 'paw-outline' as const, label: 'Moji upiti', helper: 'Upiti koje si poslao/la pružateljima', route: '/dashboard/owner/requests' },
    ...(isProvider ? [{ icon: 'briefcase-outline' as const, label: 'Upiti za usluge', helper: 'Novi upiti za tvoje usluge', route: '/dashboard/sitter/requests' }] : []),
    { icon: 'notifications-outline' as const, label: 'Obavijesti', helper: 'In-app obavijesti za upite i poruke', route: '/notifications' },
    { icon: 'grid-outline' as const, label: 'Dashboard', helper: 'Brzi pregled PetPark računa', route: '/(tabs)' },
    { icon: 'chatbubble-outline' as const, label: 'Poruke', helper: 'Razgovori i podrška', route: '/messages' },
    { icon: 'heart-outline' as const, label: 'Favoriti', helper: 'Spremljeni profili i usluge', route: '/(tabs)' },
    { icon: 'card-outline' as const, label: 'Narudžbe', helper: 'Shop košarica i narudžbe', route: '/cart' },
    { icon: 'settings-outline' as const, label: 'Postavke', helper: 'Postavke profila', route: '/(tabs)' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {typeof user!.avatar === 'string' && user!.avatar.startsWith('http') ? (
          <Image source={{ uri: user!.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user!.avatar}</Text>
          </View>
        )}
        <Text style={styles.userName}>{user!.name}</Text>
        <Text style={styles.userEmail}>{user!.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user!.role === 'vlasnik' ? 'Vlasnik ljubimca' : user!.role === 'sitter' ? 'Pet sitter' : 'Vlasnik & Sitter'}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={Colors.muted} />
          <Text style={styles.locationText}>{user!.city}</Text>
        </View>

        <View style={styles.statusStack}>
          <View style={[styles.statusPill, onboardingCompleted ? styles.statusPillSuccess : styles.statusPillWarning]}>
            <Text style={[styles.statusPillText, onboardingCompleted ? styles.statusPillTextSuccess : styles.statusPillTextWarning]}>
              {onboardingCompleted ? 'Onboarding dovršen' : 'Onboarding nije dovršen'}
            </Text>
          </View>

          {user!.role === 'sitter' ? (
            <View style={[styles.statusPill, verificationStatus === 'pending' ? styles.statusPillInfo : styles.statusPillMuted]}>
              <Text style={[styles.statusPillText, verificationStatus === 'pending' ? styles.statusPillTextInfo : styles.statusPillTextMuted]}>
                {verificationStatus === 'pending' ? 'Verifikacija na čekanju' : 'Nije verificiran'}
              </Text>
            </View>
          ) : null}
        </View>

        {!onboardingCompleted ? (
          <Button title="Dovrši onboarding" onPress={() => router.push('/onboarding')} size="medium" style={styles.onboardingButton} />
        ) : null}
      </View>

      {/* Verification Details (sitters only) */}
      {user!.role === 'sitter' && verificationStatus !== 'none' ? (
        <View style={styles.verificationCard}>
          <View style={styles.verificationHeader}>
            <Ionicons
              name={verificationStatus === 'pending' ? 'time-outline' : verificationStatus === 'verified' ? 'checkmark-circle' : 'alert-circle-outline'}
              size={20}
              color={verificationStatus === 'pending' ? '#2563EB' : verificationStatus === 'verified' ? '#16A34A' : Colors.muted}
            />
            <Text style={styles.verificationTitle}>Verifikacija</Text>
            <View style={[
              styles.verificationBadge,
              verificationStatus === 'pending' && styles.verificationBadgePending,
              verificationStatus === 'verified' && styles.verificationBadgeVerified,
            ]}>
              <Text style={[
                styles.verificationBadgeText,
                verificationStatus === 'pending' && styles.verificationBadgeTextPending,
                verificationStatus === 'verified' && styles.verificationBadgeTextVerified,
              ]}>
                {verificationStatus === 'pending' ? 'Na čekanju' : verificationStatus === 'verified' ? 'Verificiran' : verificationStatus}
              </Text>
            </View>
          </View>

          {verificationDocs.length > 0 ? (
            <View style={styles.verificationRow}>
              <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.verificationDetail}>
                {verificationDocs.length} {verificationDocs.length === 1 ? 'dokument poslan' : 'dokumenta poslana'}
              </Text>
            </View>
          ) : null}

          {verificationNotes ? (
            <View style={styles.verificationRow}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.verificationDetail} numberOfLines={2}>{verificationNotes}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={22} color={Colors.text} />
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuHelper}>{item.helper}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>

      {/* Footer Links */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/messages' as any)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
          <Text style={styles.footerLinkText}>Chat podrška</Text>
        </TouchableOpacity>
        <View style={styles.footerDivider} />
        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/privacy' as any)}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.muted} />
          <Text style={styles.footerLinkText}>Politika privatnosti</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/terms' as any)}>
          <Ionicons name="document-text-outline" size={18} color={Colors.muted} />
          <Text style={styles.footerLinkText}>Uvjeti korištenja</Text>
        </TouchableOpacity>
        <Text style={styles.footerVersion}>PetPark v1.0.0</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  guestEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  fullWidth: {
    width: '100%',
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
    flexDirection: 'column',
    gap: 10,
    alignSelf: 'center',
    width: '70%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    minHeight: 48,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.muted,
  },
  statusStack: {
    marginTop: 14,
    gap: 8,
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusPillSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusPillWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusPillInfo: {
    backgroundColor: '#DBEAFE',
  },
  statusPillMuted: {
    backgroundColor: '#F3F4F6',
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusPillTextSuccess: {
    color: '#166534',
  },
  statusPillTextWarning: {
    color: '#92400E',
  },
  statusPillTextInfo: {
    color: '#1D4ED8',
  },
  statusPillTextMuted: {
    color: Colors.textSecondary,
  },
  onboardingButton: {
    width: '100%',
    marginTop: 14,
  },
  verificationCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    gap: 10,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  verificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  verificationBadgePending: {
    backgroundColor: '#DBEAFE',
  },
  verificationBadgeVerified: {
    backgroundColor: '#DCFCE7',
  },
  verificationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  verificationBadgeTextPending: {
    color: '#1D4ED8',
  },
  verificationBadgeTextVerified: {
    color: '#166534',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  verificationDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  menu: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuTextWrap: {
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  menuHelper: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    marginTop: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  footerLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 8,
  },
});
