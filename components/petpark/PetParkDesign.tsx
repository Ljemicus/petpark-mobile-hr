import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, PetParkRadii, PetParkShadow, PetParkSpacing } from '../../lib/colors';

type Tone = 'default' | 'orange' | 'forest' | 'teal' | 'sage' | 'danger' | 'muted';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

const toneStyles: Record<Tone, { backgroundColor: string; borderColor: string; color: string }> = {
  default: { backgroundColor: Colors.creamSurface, borderColor: Colors.warmBorder, color: Colors.text },
  orange: { backgroundColor: Colors.orangeSoft, borderColor: Colors.orangeBorder, color: Colors.orangePrimary },
  forest: { backgroundColor: Colors.forestSoft, borderColor: Colors.forestSoft, color: Colors.forest },
  teal: { backgroundColor: Colors.tealSoft, borderColor: Colors.tealSoft, color: Colors.teal },
  sage: { backgroundColor: Colors.sageSurface, borderColor: Colors.sageSurface, color: Colors.forest },
  danger: { backgroundColor: Colors.dangerSoft, borderColor: Colors.dangerSoft, color: Colors.error },
  muted: { backgroundColor: Colors.warmSurface, borderColor: Colors.warmBorder, color: Colors.mutedText },
};

const buttonVariants: Record<ButtonVariant, { backgroundColor: string; borderColor: string; color: string; shadow: boolean }> = {
  primary: { backgroundColor: Colors.orangePrimary, borderColor: Colors.orangePrimary, color: Colors.white, shadow: true },
  secondary: { backgroundColor: Colors.forest, borderColor: Colors.forest, color: Colors.white, shadow: true },
  outline: { backgroundColor: Colors.white, borderColor: Colors.warmBorder, color: Colors.orangePrimary, shadow: false },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', color: Colors.orangePrimary, shadow: false },
  danger: { backgroundColor: Colors.error, borderColor: Colors.error, color: Colors.white, shadow: true },
};

const buttonSizes: Record<ButtonSize, ViewStyle> = {
  small: { minHeight: 36, paddingHorizontal: 14, paddingVertical: 8 },
  medium: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12 },
  large: { minHeight: 54, paddingHorizontal: 22, paddingVertical: 15 },
};

export function PetParkScreen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function PetParkCard({ children, style, elevated = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; elevated?: boolean }) {
  return <View style={[styles.card, elevated && styles.elevated, style]}>{children}</View>;
}

export function PetParkSectionCard({ eyebrow, title, children, style }: { eyebrow?: string; title?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <PetParkCard style={[styles.sectionCard, style]} elevated={false}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={title || eyebrow ? styles.sectionBody : undefined}>{children}</View>
    </PetParkCard>
  );
}

export function PetParkButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const variantStyle = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonSizes[size],
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
        },
        variantStyle.shadow && styles.buttonShadow,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={variantStyle.color} /> : <Text style={[styles.buttonText, { color: variantStyle.color }, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

export function PetParkBadge({ label, tone = 'orange', style }: { label: string; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor, borderColor: toneStyle.borderColor }, style]}>
      <Text style={[styles.badgeText, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

export function PetParkStatusChip({ status, label }: { status: 'pending' | 'contacted' | 'closed' | 'withdrawn' | string; label?: string }) {
  const tone: Tone = status === 'contacted' ? 'teal' : status === 'closed' ? 'muted' : status === 'withdrawn' ? 'danger' : 'orange';
  const fallback = status === 'contacted' ? 'Kontaktiran' : status === 'closed' ? 'Zatvoreno' : status === 'withdrawn' ? 'Povučen' : 'Poslano';
  return <PetParkBadge label={label || fallback} tone={tone} />;
}

export function PetParkInput({ label, helper, error, style, inputStyle, ...props }: TextInputProps & { label?: string; helper?: string; error?: string; style?: StyleProp<ViewStyle>; inputStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.muted}
        {...props}
        style={[styles.input, error ? styles.inputError : null, inputStyle]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

export function PetParkInfoCallout({ title, body, tone = 'sage', style }: { title?: string; body: string; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.callout, { backgroundColor: toneStyle.backgroundColor, borderColor: toneStyle.borderColor }, style]}>
      {title ? <Text style={[styles.calloutTitle, { color: toneStyle.color }]}>{title}</Text> : null}
      <Text style={styles.calloutBody}>{body}</Text>
    </View>
  );
}

export function PetParkPrivacyCallout({ body = 'Podaci su vidljivi samo stranama koje sudjeluju u ovom upitu. Ovo nije potvrđena rezervacija i ne pokreće plaćanje.' }: { body?: string }) {
  return <PetParkInfoCallout title="Privatnost i sigurnost" body={body} tone="sage" />;
}

export function PetParkEmptyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <PetParkCard style={styles.emptyState} elevated={false}>
      <Text style={styles.emptyIcon}>🐾</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? <PetParkButton title={actionLabel} onPress={onAction} variant="outline" size="small" style={styles.emptyAction} /> : null}
    </PetParkCard>
  );
}

export function PetParkListCard({ title, subtitle, meta, badge, children, onPress, style }: { title: string; subtitle?: string; meta?: string; badge?: React.ReactNode; children?: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const content = (
    <PetParkCard style={[styles.listCard, style]}>
      <View style={styles.listHeader}>
        <View style={styles.listTitleWrap}>
          <Text style={styles.listTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={styles.listSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
        </View>
        {badge}
      </View>
      {meta ? <Text style={styles.listMeta}>{meta}</Text> : null}
      {children ? <View style={styles.listBody}>{children}</View> : null}
    </PetParkCard>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    borderRadius: PetParkRadii.card,
    padding: PetParkSpacing.lg,
  },
  elevated: {
    shadowColor: PetParkShadow.color,
    shadowOffset: PetParkShadow.offset,
    shadowOpacity: PetParkShadow.opacity,
    shadowRadius: PetParkShadow.radius,
    elevation: PetParkShadow.elevation,
  },
  sectionCard: {
    backgroundColor: Colors.creamSurface,
  },
  eyebrow: {
    color: Colors.orangePrimary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: Colors.forest,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 4,
  },
  sectionBody: {
    marginTop: 12,
  },
  button: {
    borderWidth: 1,
    borderRadius: PetParkRadii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    shadowColor: Colors.orangeShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 3,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrap: {
    gap: 7,
  },
  inputLabel: {
    color: Colors.forest,
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    backgroundColor: Colors.white,
    borderRadius: PetParkRadii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  inputError: {
    borderColor: Colors.error,
  },
  helperText: {
    color: Colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  callout: {
    borderWidth: 1,
    borderRadius: PetParkRadii.cardSmall,
    padding: 14,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  calloutBody: {
    color: Colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: Colors.creamSurface,
    paddingVertical: 28,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: Colors.forest,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyBody: {
    color: Colors.mutedText,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: 16,
  },
  listCard: {
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    color: Colors.forest,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  listSubtitle: {
    color: Colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 4,
  },
  listMeta: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  listBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.warmBorder,
    paddingTop: 10,
  },
});
