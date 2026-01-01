'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, themes } from '@/lib/themes';

interface ThemeContextType {
    theme: ThemeId;
    setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    initialTheme = 'luxury'
}: {
    children: React.ReactNode;
    initialTheme?: ThemeId;
}) {
    const [theme, setTheme] = useState<ThemeId>(initialTheme);

    useEffect(() => {
        const root = document.documentElement;
        const activeTheme = themes[theme];

        // Clean up previous classes if generic "dark" class handling is used elsewhere
        // But mainly we rely on CSS variables
        if (theme === 'luxury') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Set CSS variables
        Object.entries(activeTheme.colors).forEach(([key, value]) => {
            // Convert camelCase to kebab-case for CSS variables
            const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        });

        // Set other design tokens
        root.style.setProperty('--radius', activeTheme.radius);
        if (activeTheme.gradient) {
            root.style.setProperty('--bg-gradient', activeTheme.gradient);
        }

    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
