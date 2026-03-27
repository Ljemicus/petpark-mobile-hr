import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../lib/colors';
import Badge from './Badge';
import { Sitter } from '../lib/mock-data';

interface SitterCardProps {
  sitter: Sitter;
  horizontal?: boolean;
}

export default function SitterCard({ sitter, horizontal }: SitterCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontalCard]}
      onPress={() => router.push(`/sitter/${sitter.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: sitter.avatar }} style={styles.avatar} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{sitter.name}</Text>
          {sitter.verified && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          )}
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.muted} />
          <Text style={styles.city}>{sitter.city}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.star} />
          <Text style={styles.rating}>{sitter.rating}</Text>
          <Text style={styles.reviewCount}>({sitter.reviewCount})</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{sitter.pricePerHour}€/sat</Text>
          <View style={styles.services}>
            {sitter.services.slice(0, 2).map((s) => (
              <Badge key={s} text={s} />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 280,
    marginRight: 12,
    marginBottom: 0,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  city: {
    fontSize: 13,
    color: Colors.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  services: {
    flexDirection: 'row',
    gap: 4,
  },
});
