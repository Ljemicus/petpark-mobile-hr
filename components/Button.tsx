import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../lib/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', size = 'medium', style, textStyle, disabled }: ButtonProps) {
  const containerVariantStyle = {
    primary: styles.primary,
    outline: styles.outline,
    ghost: styles.ghost,
  }[variant];
  const containerSizeStyle = {
    small: styles.smallSize,
    medium: styles.mediumSize,
    large: styles.largeSize,
  }[size];
  const variantTextStyle = {
    primary: styles.primaryText,
    outline: styles.outlineText,
    ghost: styles.ghostText,
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        containerVariantStyle,
        containerSizeStyle,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, variantTextStyle, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  smallSize: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mediumSize: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  largeSize: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
});
