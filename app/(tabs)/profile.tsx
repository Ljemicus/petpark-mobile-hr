import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { useAuth } from '../../lib/auth-context';
import Button from '../../components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <Text style={styles.guestEmoji}>🐾</Text>
          <Text style={styles.guestTitle}>Dobrodošli u Šapicu!</Text>
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
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color={Colors.text} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const menuItems = [
    { icon: 'grid-outline' as const, label: 'Dashboard', route: '/(tabs)' },
    { icon: 'chatbubble-outline' as const, label: 'Poruke', route: '/(tabs)' },
    { icon: 'heart-outline' as const, label: 'Favoriti', route: '/(tabs)' },
    { icon: 'card-outline' as const, label: 'Narudžbe', route: '/cart' },
    { icon: 'settings-outline' as const, label: 'Postavke', route: '/(tabs)' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user!.avatar}</Text>
        </View>
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
        <Text style={styles.footerVersion}>Šapica v1.0.0</Text>
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
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
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
