import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import { DASHBOARD_LINKS, getPrimaryDashboardRoute } from '../../lib/navigation';
import Button from '../../components/Button';
import PetParkLogo from '../../components/PetParkLogo';

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
      <ScrollView style={styles.container} contentContainerStyle={styles.guestContent} showsVerticalScrollIndicator={false}>
        <View style={styles.guestHero}>
          <PetParkLogo width={190} style={styles.guestLogo} />
          <Text style={styles.guestTitle}>Dobrodošao/la u PetPark.</Text>
          <Text style={styles.guestSubtitle}>Prijavi se za upite, obavijesti, razgovore i svoj PetPark profil.</Text>

          <View style={styles.authButtons}>
            <Button title="Prijavi se" onPress={() => router.push('/login')} size="large" style={styles.fullWidth} />
            <Button title="Registriraj se" onPress={() => router.push('/register')} variant="outline" size="large" style={styles.fullWidth} />
          </View>
        </View>

        <View style={styles.guestNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.teal} />
          <View style={styles.guestNoteCopy}>
            <Text style={styles.guestNoteTitle}>Jedan račun za cijelu zajednicu</Text>
            <Text style={styles.guestNoteText}>Usluge, upozorenja, forum i poruke ostaju na jednom mjestu.</Text>
          </View>
        </View>

        <View style={styles.socialDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>uskoro</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Uskoro', 'Prijava putem Apple računa dolazi uskoro.')}>
            <Ionicons name="logo-apple" size={21} color={Colors.text} />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Uskoro', 'Prijava putem Google računa dolazi uskoro.')}>
            <Ionicons name="logo-google" size={21} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const primaryDashboardRoute = getPrimaryDashboardRoute(user);

  const menuItems = [
    { icon: 'grid-outline' as const, label: 'Dashboard', route: primaryDashboardRoute },
    { icon: 'paw-outline' as const, label: 'Moji ljubimci', route: '/dashboard/owner/pets' },
    { icon: 'calendar-outline' as const, label: 'Moje rezervacije', route: '/dashboard/owner/bookings' },
    { icon: 'chatbubble-outline' as const, label: 'Poruke', route: '/chat' },
    { icon: 'cash-outline' as const, label: 'Povijest plaćanja', route: '/payments/history' },
    { icon: 'card' as const, label: 'Načini plaćanja', route: '/payments/methods' },
    { icon: 'settings-outline' as const, label: 'Postavke', route: '/(tabs)' },
  ];

  const providerDashboards = DASHBOARD_LINKS;

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

      <View style={styles.dashboardSwitcher}>
        <Text style={styles.dashboardSwitcherTitle}>Dashboardi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dashboardChips}>
          {providerDashboards.map((item) => (
            <TouchableOpacity key={item.label} style={styles.dashboardChip} onPress={() => router.push(item.route as any)}>
              <Ionicons name={item.icon} size={16} color={Colors.primary} />
              <Text style={styles.dashboardChipText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={22} color={Colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
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
        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/chat' as any)}>
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
  guestContent: {
    padding: 16,
    paddingBottom: 116,
  },
  guestHero: {
    alignItems: 'center',
    padding: 22,
    borderRadius: 30,
    backgroundColor: Colors.warmSurface,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    marginTop: 8,
  },
  guestLogo: {
    marginBottom: 18,
  },
  guestTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.7,
  },
  guestSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 22,
  },
  guestNote: {
    marginTop: 12,
    backgroundColor: Colors.creamSurface,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestNoteCopy: {
    flex: 1,
  },
  guestNoteTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.text,
  },
  guestNoteText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
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
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.creamSurface,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
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
  dashboardSwitcher: {
    marginTop: 18,
    marginHorizontal: 20,
  },
  dashboardSwitcherTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  dashboardChips: {
    gap: 10,
  },
  dashboardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  dashboardChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
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
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
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
