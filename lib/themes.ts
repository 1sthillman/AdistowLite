export type ThemeId = 'luxury' | 'coffee';

export interface ThemeColors {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    backgroundOverlay: string; // For glass effects
    card: string;
    cardForeground: string;
    border: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
}

export interface ThemeConfig {
    id: ThemeId;
    name: string;
    gradient?: string; // For premium backgrounds
    colors: ThemeColors;
    radius: string; // border-radius token
    fontStyle?: string;
}

export const themes: Record<ThemeId, ThemeConfig> = {
    luxury: {
        id: 'luxury',
        name: 'Midnight Luxury',
        gradient: 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.1) 0px, transparent 50%)',
        colors: {
            primary: '#10b981', // restqr-emerald-500
            primaryForeground: '#ffffff',
            secondary: '#f59e0b', // restqr-gold-500
            secondaryForeground: '#ffffff',
            accent: '#064e3b', // darker emerald
            accentForeground: '#ececec',
            background: '#0a0a0a',
            backgroundOverlay: 'rgba(255, 255, 255, 0.03)',
            card: 'rgba(255, 255, 255, 0.04)',
            cardForeground: '#ffffff',
            border: 'rgba(255, 255, 255, 0.1)',
            muted: '#27272a',
            mutedForeground: '#a1a1aa',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        radius: '1.5rem',
    },
    coffee: {
        id: 'coffee',
        name: 'Nordic Coffee',
        gradient: 'radial-gradient(at 0% 0%, rgba(120, 113, 108, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 162, 158, 0.1) 0px, transparent 50%)',
        colors: {
            primary: '#78350f', // deep brown
            primaryForeground: '#ffffff',
            secondary: '#d6d3d1', // warm grey
            secondaryForeground: '#292524',
            accent: '#f5f5f4', // very light warm grey
            accentForeground: '#1c1917',
            background: '#fafaf9', // stone-50
            backgroundOverlay: 'rgba(255, 255, 255, 0.6)',
            card: '#ffffff',
            cardForeground: '#292524', // stone-800
            border: 'rgba(0, 0, 0, 0.05)',
            muted: '#f5f5f4',
            mutedForeground: '#78716c',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        radius: '1rem',
    }
};
