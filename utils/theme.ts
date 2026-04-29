export const palette = {
  light: {
    bg: 'bg-slate-50',
    bgPlain: '#F8FAFC',
    surface: 'bg-white',
    surfaceHex: '#FFFFFF',
    surfaceAlt: 'bg-slate-100',
    surfaceAltHex: '#F1F5F9',
    border: 'border-slate-200',
    borderHex: '#E2E8F0',
    text: 'text-slate-900',
    textHex: '#0F172A',
    textSecondary: 'text-slate-500',
    textSecondaryHex: '#64748B',
    textMuted: 'text-slate-400',
    placeholder: '#94A3B8',
    icon: '#475569',
    iconMuted: '#94A3B8',
  },
  dark: {
    bg: 'bg-slate-950',
    bgPlain: '#020617',
    surface: 'bg-slate-900',
    surfaceHex: '#0F172A',
    surfaceAlt: 'bg-slate-800',
    surfaceAltHex: '#1E293B',
    border: 'border-slate-800',
    borderHex: '#1E293B',
    text: 'text-white',
    textHex: '#F8FAFC',
    textSecondary: 'text-slate-400',
    textSecondaryHex: '#94A3B8',
    textMuted: 'text-slate-500',
    placeholder: '#64748B',
    icon: '#CBD5E1',
    iconMuted: '#64748B',
  },
};

export const brand = {
  primary: '#6366F1',
  primaryDeep: '#4F46E5',
  primaryLight: '#A5B4FC',
  accent: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export type ThemeMode = 'light' | 'dark';

export const tokens = (mode: ThemeMode) => (mode === 'dark' ? palette.dark : palette.light);
