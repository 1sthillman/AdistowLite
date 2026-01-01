'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#0a0a0a',
                    color: '#fff',
                    border: '1px solid rgba(0, 204, 163, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 0 20px rgba(0, 204, 163, 0.2)',
                },
                success: {
                    iconTheme: {
                        primary: '#00cca3',
                        secondary: '#0a0a0a',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#0a0a0a',
                    },
                },
            }}
        />
    );
}
