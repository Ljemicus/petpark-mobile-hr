import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../lib/colors';

type BadgeTone = 'orange' | 'forest' | 'teal' | 'sage' | 'muted' | 'danger';

interface BadgeProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, { color: string; backgroundColor: string; borderColor: string }> = {
  orange: { color: Colors.orangePrimary, backgroundColor: Colors.orangeSoft, borderColor: Colors.orangeBorder },
  forest: { color: Colors.forest, backgroundColor: Colors.forestSoft, borderColor: Colors.forestSoft },
  teal: { color: Colors.teal, backgroundColor: Colors.tealSoft, borderColor: Colors.tealSoft },
  sage: { color: Colors.forest, backgroundColor: Colors.sageSurface, borderColor: Colors.sageSurface },
  muted: { color: Colors.mutedText, backgroundColor: Colors.warmSurface, borderColor: Colors.warmBorder },
  danger: { color: Colors.error, backgroundColor: Colors.dangerSoft, borderColor: Colors.dangerSoft },
};

export default function Badge({ text, color, backgroundColor, tone = 'orange' }: BadgeProps) {
  const toneStyle = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor || toneStyle.backgroundColor, borderColor: toneStyle.borderColor }]}>
      <Text style={[styles.text, { color: color || toneStyle.color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
