'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // GitHub Pages SPA Trick: If we hit a 404, try to redirect to the home page
        // with the current path in mind. However, since we are using static export
        // and basePath '/AdistowLite', we might just want to go back or show a helpful message.
        // For now, let's just redirect to the root of the app.
        router.replace('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400">Yönlendiriliyorsunuz...</p>
            </div>
        </div>
    );
}
