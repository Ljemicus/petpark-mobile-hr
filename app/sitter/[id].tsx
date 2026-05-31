import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { Sitter } from '../../lib/mock-data';
import { getSitterById } from '../../lib/db';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../lib/auth-context';

export default function SitterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getSitterById(id!);
      setSitter(data);
      setLoading(false);
    })();
  }, [id]);

  const handleBookPress = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push({
      pathname: '/booking/[sitterId]',
      params: { sitterId: id! },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!sitter) {
    return (
      <View style={styles.center}>
        <Text>Sitter nije pronađen</Text>
      </View>
    );
  }

  const reviews = [
    { id: '1', author: 'Marina K.', rating: 5, text: 'Odličan sitter! Moj pas je bio jako sretan.', date: 'Prije 3 dana' },
    { id: '2', author: 'Tomislav P.', rating: 5, text: 'Profesionalan i pouzdan. Topla preporuka!', date: 'Prije 1 tjedan' },
    { id: '3', author: 'Jelena S.', rating: 4, text: 'Vrlo zadovoljna uslugom, sigurno ćemo opet.', date: 'Prije 2 tjedna' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: sitter.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.nameSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{sitter.name}</Text>
            {sitter.verified && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.city}>{sitter.city}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="star" size={20} color={Colors.star} />
          <Text style={styles.statValue}>{sitter.rating}</Text>
          <Text style={styles.statLabel}>Ocjena</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="chatbubble" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{sitter.reviewCount}</Text>
          <Text style={styles.statLabel}>Recenzija</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="cash" size={20} color={Colors.success} />
          <Text style={styles.statValue}>{sitter.pricePerHour}€</Text>
          <Text style={styles.statLabel}>Po satu</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O meni</Text>
        <Text style={styles.bio}>{sitter.bio}</Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usluge</Text>
        <View style={styles.services}>
          {sitter.services.map((service) => (
            <Badge key={service} text={service} />
          ))}
        </View>
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recenzije</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color={Colors.star} />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        ))}
      </View>

      {/* Booking CTA */}
      <View style={styles.bookingSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Cijena:</Text>
          <Text style={styles.priceValue}>{sitter.pricePerHour}€/sat</Text>
        </View>
        <Button title="Rezerviraj termin" onPress={handleBookPress} size="large" style={{ width: '100%' }} />
        {!user && (
          <Text style={styles.loginHint}>Morate biti prijavljeni za rezervaciju</Text>
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  city: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.muted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 6,
  },
  bookingSection: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
  },
  loginHint: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
});
