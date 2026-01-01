import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Premium Palette Definition
                luxury: {
                    black: '#1A1A1A', // Deep Charcoal (Main BG)
                    cream: '#FAF7F2', // Warm Ivory (Card BG)
                    emerald: '#065F46', // Emerald Luxury (Accent)
                    gold: '#D97706', // Amber Gold (Premium)
                },
                secondary: {
                    sage: '#10B981',
                    rust: '#EA580C',
                    slate: '#64748B',
                    border: '#E7E5E4'
                },
                // Existing compatibility (mapped to new palette)
                'restqr-emerald': {
                    500: '#10B981',
                    600: '#065F46', // Mapped to luxury emerald
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
                mono: ['var(--font-jetbrains)', 'monospace'],
            },
            boxShadow: {
                'premium': '0 20px 40px -4px rgba(0, 0, 0, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'aurora': 'linear-gradient(to bottom, #1A1A1A, #0f172a)',
                'gold-gradient': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-in': 'scaleIn 0.4s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'morph': 'morph 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                morph: {
                    '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
                    '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
                    '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' }
                }
            },
        },
    },
    plugins: [],
};

export default config;
