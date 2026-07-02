import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

type DisabledModuleProps = {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export default function DisabledModule({
  title,
  message = 'Radimo na tome. Hvala na strpljenju.',
  icon = 'construct-outline',
  actionLabel,
  onAction,
}: DisabledModuleProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={34} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.86}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  card: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: 28,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orangeSoft,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  message: { color: Colors.textSecondary, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 16, backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: Colors.white, fontWeight: '700' },
});
