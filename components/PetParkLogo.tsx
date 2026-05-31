import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

export default function PetParkLogo({ width = 152, style }: { width?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={require('../assets/brand/petpark-logo-720.png')}
      style={[styles.logo, { width, height: Math.round(width * 209 / 720) }, style]}
      resizeMode="contain"
      accessibilityLabel="PetPark"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
