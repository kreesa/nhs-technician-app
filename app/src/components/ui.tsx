import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, ViewStyle,
} from 'react-native';
import { TechColors, TechRadius, TechStyles } from './theme';

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'orange';
const badgeMap: Record<BadgeVariant, { bg: string; color: string }> = {
  blue:   { bg: TechColors.brandBg,  color: TechColors.brand },
  green:  { bg: TechColors.greenBg,  color: TechColors.green },
  amber:  { bg: TechColors.amberBg,  color: TechColors.amber },
  red:    { bg: TechColors.redBg,    color: TechColors.red },
  gray:   { bg: '#E2E8F0',           color: '#64748B' },
  orange: { bg: TechColors.accentBg, color: TechColors.accent },
};

export const TechBadge = ({ label, variant = 'gray' }: { label: string; variant?: BadgeVariant }) => {
  const s = badgeMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{label}</Text>
    </View>
  );
};

// ─── Button ───────────────────────────────────────────────────────────────────
interface TechButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'accent' | 'outline' | 'danger';
  icon?: string;
}

export const TechButton = ({ label, onPress, loading, disabled, style, variant = 'primary', icon }: TechButtonProps) => {
  const btnStyle = variant === 'accent' ? TechStyles.btnAccent
    : variant === 'outline' ? TechStyles.btnOutline
    : variant === 'danger' ? TechStyles.btnDanger
    : TechStyles.btnPrimary;
  const txtStyle = variant === 'accent' ? TechStyles.btnAccentText
    : variant === 'outline' ? TechStyles.btnOutlineText
    : variant === 'danger' ? TechStyles.btnDangerText
    : TechStyles.btnPrimaryText;

  return (
    <TouchableOpacity
      style={[btnStyle, (disabled || loading) && { opacity: 0.55 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' ? TechColors.brand : TechColors.white} />
        : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
            <Text style={txtStyle}>{label}</Text>
          </View>
      }
    </TouchableOpacity>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const TechCard = ({ children, label, style }: { children: React.ReactNode; label?: string; style?: ViewStyle }) => (
  <View style={[TechStyles.card, style]}>
    {label && <Text style={TechStyles.cardLabel}>{label}</Text>}
    {children}
  </View>
);

// ─── Row KV ───────────────────────────────────────────────────────────────────
export const TechRowKV = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <View style={[TechStyles.rowKV, last && { borderBottomWidth: 0 }]}>
    <Text style={TechStyles.rowK}>{label}</Text>
    <Text style={TechStyles.rowV}>{value}</Text>
  </View>
);

// ─── Topbar ───────────────────────────────────────────────────────────────────
export const TechTopbar = ({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) => (
  <View style={TechStyles.topbar}>
    {onBack && (
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={{ color: TechColors.white, fontSize: 20 }}>‹</Text>
      </TouchableOpacity>
    )}
    <Text style={TechStyles.topbarTitle}>{title}</Text>
    {right}
  </View>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const TechAvatar = ({ initials, size = 44 }: { initials: string; size?: number }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={{ fontSize: size * 0.34, fontWeight: '700', color: TechColors.brand }}>{initials}</Text>
  </View>
);

// ─── Loading / Error ──────────────────────────────────────────────────────────
export const TechLoading = ({ message = 'Loading...' }: { message?: string }) => (
  <View style={[TechStyles.screen, TechStyles.center]}>
    <ActivityIndicator size="large" color={TechColors.brand} />
    <Text style={{ marginTop: 12, color: TechColors.text2, fontSize: 14 }}>{message}</Text>
  </View>
);

// ─── Status dot ──────────────────────────────────────────────────────────────
export const StatusDot = ({ active }: { active: boolean }) => (
  <View style={[styles.statusDot, { backgroundColor: active ? TechColors.green : TechColors.text3 }]} />
);

// ─── Summary Tile ─────────────────────────────────────────────────────────────
export const SummaryTile = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <View style={[styles.summaryTile, { borderLeftColor: color }]}>
    <Text style={{ fontSize: 26 }}>{icon}</Text>
    <Text style={styles.summaryVal}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const TechDivider = () => <View style={TechStyles.divider} />;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: TechRadius.full },
  badgeText: { fontSize: 11, fontWeight: '600' },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 4,
  },
  avatar: {
    backgroundColor: TechColors.brandBg,
    alignItems: 'center', justifyContent: 'center',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  summaryTile: {
    flex: 1, backgroundColor: TechColors.cardBg,
    borderRadius: TechRadius.lg, padding: 14,
    alignItems: 'center', gap: 4,
    borderLeftWidth: 3, borderWidth: 0.5,
    borderColor: TechColors.border,
  },
  summaryVal: { fontSize: 20, fontWeight: '700', color: TechColors.text },
  summaryLabel: { fontSize: 11, color: TechColors.text2, textAlign: 'center' },
});
