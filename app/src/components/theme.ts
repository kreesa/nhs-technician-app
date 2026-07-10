import { StyleSheet } from 'react-native';

// ─── Colors ───────────────────────────────────────────────────────────────────
export const TechColors = {
  brand: '#0F6E56',        // Primary brand green
  brandDark: '#0A5241',    // Darker shade for headers/buttons
  brandBg: '#E4F4EF',      // Soft green background

  accent: '#F97316',       // Orange accent
  accentBg: '#FFF0E4',

  blue: '#2563EB',         // Informational blue
  blueBg: '#DBEAFE',

  red: '#DC2626',
  redBg: '#FEE2E2',

  amber: '#D97706',
  amberBg: '#FEF3C7',

  pageBg: '#F8FAF9',       // Slight warm off-white
  cardBg: '#FFFFFF',

  border: 'rgba(0,0,0,0.08)',
  borderMd: 'rgba(0,0,0,0.13)',

  text: '#0F172A',
  text2: '#475569',
  text3: '#94A3B8',

  white: '#FFFFFF',
};

export const TechRadius = {
  sm: 8, md: 10, lg: 12, xl: 16, full: 9999,
};

export const TechSpacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
};

// ─── Common Styles ────────────────────────────────────────────────────────────
export const TechStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TechColors.pageBg },
  card: {
    backgroundColor: TechColors.cardBg,
    borderRadius: TechRadius.xl,
    padding: TechSpacing.lg,
    borderWidth: 0.5,
    borderColor: TechColors.border,
    marginBottom: TechSpacing.md,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '600', color: TechColors.text3,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: TechSpacing.md,
  },
  topbar: {
    backgroundColor: TechColors.brandDark,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TechSpacing.lg,
    gap: 10,
  },
  topbarTitle: { fontSize: 17, fontWeight: '600', color: TechColors.white, flex: 1 },
  btnPrimary: {
    backgroundColor: TechColors.brand,
    borderRadius: TechRadius.lg, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { color: TechColors.white, fontSize: 15, fontWeight: '600' },
  btnAccent: {
    backgroundColor: TechColors.accent,
    borderRadius: TechRadius.lg, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  btnAccentText: { color: TechColors.white, fontSize: 15, fontWeight: '600' },
  btnOutline: {
    borderWidth: 1.5, borderColor: TechColors.brand,
    borderRadius: TechRadius.lg, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { color: TechColors.brand, fontSize: 15, fontWeight: '600' },
  btnDanger: {
    borderWidth: 1.5, borderColor: TechColors.red,
    borderRadius: TechRadius.lg, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDangerText: { color: TechColors.red, fontSize: 15, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: TechColors.borderMd,
    borderRadius: TechRadius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, backgroundColor: TechColors.pageBg,
    color: TechColors.text, height: 44,
  },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: TechColors.text2, marginBottom: 5 },
  rowKV: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: TechColors.border,
  },
  rowK: { fontSize: 13, color: TechColors.text2 },
  rowV: { fontSize: 13, fontWeight: '500', color: TechColors.text },
  divider: { height: 0.5, backgroundColor: TechColors.border, marginVertical: 12 },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
});
