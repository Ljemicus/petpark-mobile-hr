import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, PetParkRadii } from '../lib/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
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
  secondary: 'secondaryText',
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
    borderRadius: PetParkRadii.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 2,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.forest,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  smallSize: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mediumSize: {
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  largeSize: {
    paddingHorizontal: 24,
    paddingVertical: 17,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
});
