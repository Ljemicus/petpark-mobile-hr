import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/colors';
import { sitters, users } from '../../lib/mock-data';

type Contact = {
  id: string;
  name: string;
  subtitle: string;
  avatar?: string;
  type: 'provider' | 'user';
};

export default function NewChatScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const contacts = useMemo<Contact[]>(() => {
    const providerContacts = sitters.slice(0, 10).map((sitter) => ({
      id: sitter.id,
      name: sitter.name,
      subtitle: `${sitter.city} · ${sitter.services.slice(0, 2).join(', ')}`,
      avatar: sitter.avatar,
      type: 'provider' as const,
    }));

    const userContacts = users.map((user) => ({
      id: user.id,
      name: user.name,
      subtitle: `${user.city} · ${user.role}`,
      avatar: undefined,
      type: 'user' as const,
    }));

    const merged = [...providerContacts, ...userContacts];
    const normalized = query.trim().toLowerCase();
    return normalized
      ? merged.filter((contact) =>
          contact.name.toLowerCase().includes(normalized) ||
          contact.subtitle.toLowerCase().includes(normalized)
        )
      : merged;
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Pretraži sittere, groomere, korisnike..."
            placeholderTextColor={Colors.muted}
            style={styles.input}
          />
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.replace(`/chat/${item.id}?name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar || '')}`)
            }
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}

            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={42} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Nema rezultata</Text>
            <Text style={styles.emptyText}>Probaj drugo ime, grad ili vrstu usluge.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, backgroundColor: Colors.white },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF7ED',
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  listContent: { padding: 16 },
  separator: { height: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 64 },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { marginTop: 4, fontSize: 14, color: Colors.textSecondary },
});
