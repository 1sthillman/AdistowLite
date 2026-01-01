'use client';

import { useEffect } from 'react';

export default function ErrorSuppressor() {
    useEffect(() => {
        // AGGRESSIVE ERROR OVERLAY REMOVAL
        const removeErrorOverlays = () => {
            // Remove Next.js error overlay
            const nextjsPortal = document.querySelector('nextjs-portal');
            if (nextjsPortal) {
                nextjsPortal.remove();
            }

            // Remove React error overlay
            const reactErrorOverlay = document.querySelector('react-error-overlay');
            if (reactErrorOverlay) {
                reactErrorOverlay.remove();
            }

            // Remove any iframe error overlays
            const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe[style*="fixed"]');
            iframes.forEach(iframe => {
                if (iframe.style?.zIndex && parseInt(iframe.style.zIndex) > 1000) {
                    iframe.remove();
                }
            });

            // Remove shadow root error overlays (Next.js uses shadow DOM)
            document.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) {
                    const errorDiv = el.shadowRoot.querySelector('[class*="error"], [class*="Error"], [id*="error"]');
                    if (errorDiv) {
                        el.remove();
                    }
                }
            });
        };

        // Run immediately
        removeErrorOverlays();

        // Run every 100ms to catch dynamically added overlays
        const interval = setInterval(removeErrorOverlays, 100);

        // Suppress all errors from appearing in UI
        window.addEventListener('error', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }, true);

        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }, true);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return null;
}
