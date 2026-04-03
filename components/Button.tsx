import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../lib/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const sizeStyles = {
  small: 'smallSize',
  medium: 'mediumSize',
  large: 'largeSize',
} as const;

const variantTextStyles = {
  primary: 'primaryText',
  outline: 'outlineText',
  ghost: 'ghostText',
} as const;

export default function Button({ title, onPress, variant = 'primary', size = 'medium', style, textStyle, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[sizeStyles[size]],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, styles[variantTextStyles[variant]], textStyle]}>
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
