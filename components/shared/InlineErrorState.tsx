import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

type InlineErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export default function InlineErrorState({
  message = 'Ne možemo učitati podatke. Povuci za osvježavanje.',
  onRetry,
}: InlineErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={22} color={Colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton} activeOpacity={0.86}>
          <Text style={styles.retryText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: 14,
    gap: 8,
  },
  message: { color: Colors.error, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  retryButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  retryText: { color: Colors.error, fontWeight: '800' },
});
