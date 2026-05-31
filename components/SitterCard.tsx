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
    backgroundColor: Colors.creamSurface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    padding: 16,
    flexDirection: 'row',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 296,
    marginRight: 14,
    marginBottom: 0,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: Colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 22,
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
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
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
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
});
