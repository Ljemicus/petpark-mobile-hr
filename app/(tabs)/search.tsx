import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../lib/colors';
import { sitters } from '../../lib/mock-data';
import SearchBar from '../../components/SearchBar';
import SitterCard from '../../components/SitterCard';

const cities = ['Svi', 'Zagreb', 'Split', 'Rijeka', 'Osijek'];

export default function SearchScreen() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Svi');

  const filtered = useMemo(() => {
    return sitters.filter((s) => {
      const matchesCity = selectedCity === 'Svi' || s.city === selectedCity;
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.services.some((svc) => svc.toLowerCase().includes(search.toLowerCase()));
      return matchesCity && matchesSearch;
    });
  }, [search, selectedCity]);

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Ime, usluga..." value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.filters}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[styles.chip, selectedCity === city && styles.chipActive]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[styles.chipText, selectedCity === city && styles.chipTextActive]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SitterCard sitter={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Nema rezultata</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: Colors.white,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.muted,
  },
});
