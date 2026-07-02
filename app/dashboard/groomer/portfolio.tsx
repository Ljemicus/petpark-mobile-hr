// Groomer Portfolio Screen
// Upravljanje galerijom radova (prije/poslije)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import InlineErrorState from '../../../components/shared/InlineErrorState';
import { useAuth } from '../../../lib/auth-context';
import type { GroomerProfile, PortfolioImage } from '../../../lib/groomer-dashboard-types';
import {
  getGroomerProfile,
  getGroomerPortfolio,
  deletePortfolioImage,
  getGroomerDashboardDbLastError,
  clearGroomerDashboardDbLastError,
} from '../../../lib/groomer-dashboard-db';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;

export default function GroomerPortfolioScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<GroomerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      clearGroomerDashboardDbLastError();
      const profileData = await getGroomerProfile(userId);
      if (profileData) {
        setProfile(profileData);
        const portfolioData = await getGroomerPortfolio(profileData.id);
        setPortfolio(portfolioData);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Obriši sliku',
      'Jeste li sigurni da želite obrisati ovu sliku?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(imageId);
            try {
              const success = await deletePortfolioImage(imageId);
              if (success) {
                await fetchData();
              } else {
                Alert.alert('Greška', 'Nije moguće obrisati sliku');
              }
            } catch (err) {
              console.error('Error deleting image:', err);
              Alert.alert('Greška', 'Došlo je do pogreške');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const dashboardError = getGroomerDashboardDbLastError();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          Dodajte slike svojih radova (prije/poslije) da biste privukli više klijenata
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {dashboardError ? <InlineErrorState message="Ne možemo učitati podatke. Povuci za osvježavanje." onRetry={fetchData} /> : null}

        {portfolio.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Portfolio je prazan</Text>
            <Text style={styles.emptySubtitle}>
              Dodajte slike svojih najboljih radova da biste se istaknuli
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Dodaj prvu sliku</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gallery}>
            {portfolio.map((image, index) => (
              <View key={image.id} style={styles.imageContainer}>
                {image.is_before_after && image.before_url && image.after_url ? (
                  <View style={styles.beforeAfterContainer}>
                    <View style={styles.beforeHalf}>
                      <Image source={{ uri: image.before_url }} style={styles.halfImage} />
                      <View style={styles.labelOverlay}>
                        <Text style={styles.labelText}>Prije</Text>
                      </View>
                    </View>
                    <View style={styles.afterHalf}>
                      <Image source={{ uri: image.after_url }} style={styles.halfImage} />
                      <View style={styles.labelOverlay}>
                        <Text style={styles.labelText}>Poslije</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Image source={{ uri: image.url }} style={styles.image} />
                )}
                {image.caption && (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionText} numberOfLines={1}>
                      {image.caption}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteOverlay}
                  onPress={() => handleDeleteImage(image.id)}
                  disabled={deletingId === image.id}
                >
                  {deletingId === image.id ? (
                    <Ionicons name="refresh" size={20} color="#FFF" />
                  ) : (
                    <Ionicons name="trash" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Button Footer */}
      {portfolio.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.footerButtonText}>Dodaj novu sliku</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    padding: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  beforeAfterContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  beforeHalf: {
    width: '50%',
    height: '100%',
    position: 'relative',
  },
  afterHalf: {
    width: '50%',
    height: '100%',
    position: 'relative',
  },
  halfImage: {
    width: '100%',
    height: '100%',
  },
  labelOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  labelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  captionText: {
    color: '#FFF',
    fontSize: 12,
  },
  deleteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.background,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
