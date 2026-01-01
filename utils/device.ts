'use client';

export function getDeviceId(): string {
    if (typeof window === 'undefined') return '';

    const STORAGE_KEY = 'restoqr_device_id';
    let deviceId = localStorage.getItem(STORAGE_KEY);

    if (!deviceId) {
        // Generate a random UUID-like string
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY, deviceId);
    }

    return deviceId;
}
