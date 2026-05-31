// Breeder Documents Screen
// Prikazuje dokumente (ugovori, certifikati, rodovnici)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { useAuth } from '../../../lib/auth-context';
import type { BreederDocument } from '../../../lib/breeder-dashboard-types';
import { DOCUMENT_TYPE_LABELS } from '../../../lib/breeder-dashboard-types';
import { getBreederDocuments, getBreederProfile } from '../../../lib/breeder-dashboard-db';

export default function BreederDocumentsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [documents, setDocuments] = useState<BreederDocument[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;

    try {
      const profile = await getBreederProfile(userId);
      if (!profile) {
        setLoading(false);
        return;
      }

      const data = await getBreederDocuments(profile.id);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  }, [fetchDocuments]);

  const getDocumentIcon = (type: BreederDocument['type']) => {
    switch (type) {
      case 'contract':
        return 'document-text';
      case 'certificate':
        return 'ribbon';
      case 'pedigree':
        return 'git-branch';
      case 'health_test':
        return 'medical';
      default:
        return 'document';
    }
  };

  const renderDocumentCard = (doc: BreederDocument) => (
    <TouchableOpacity
      key={doc.id}
      style={styles.documentCard}
      onPress={() => Alert.alert('Pregled dokumenta', 'Funkcionalnost uskoro dostupna')}
    >
      <View style={styles.documentIconContainer}>
        <Ionicons
          name={getDocumentIcon(doc.type) as any}
          size={28}
          color={Colors.primary}
        />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{doc.title}</Text>
        <Text style={styles.documentType}>{DOCUMENT_TYPE_LABELS[doc.type]}</Text>
        <Text style={styles.documentDate}>
          Dodano: {new Date(doc.uploaded_at).toLocaleDateString('hr-HR')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Dokumenti</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Dodaj dokument', 'Funkcionalnost uskoro dostupna')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Document Types Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Važni dokumenti</Text>
          <Text style={styles.infoText}>
            Čuvajte sve važne dokumente na jednom mjestu: ugovore o prodaji, 
            rodovnike, certifikate i zdravstvene testove.
          </Text>
        </View>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="documents-outline" size={48} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Još nemate dokumenata</Text>
            <Text style={styles.emptySubtitle}>
              Dodajte svoje prve dokumente za lakšu organizaciju
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => Alert.alert('Dodaj dokument', 'Funkcionalnost uskoro dostupna')}
            >
              <Text style={styles.emptyButtonText}>Dodaj dokument</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {documents.map(renderDocumentCard)}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  documentType: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
