'use client';

import { useEffect, useState } from 'react';
import { getDistance } from 'geolib';

// Max distance in meters - STRICT! 50 metre
const DEFAULT_MAX_DISTANCE = 50;

interface Location {
    latitude: number;
    longitude: number;
}

export type LocationErrorType =
    | 'PERMISSION_DENIED'
    | 'POSITION_UNAVAILABLE'
    | 'TOO_FAR'
    | 'LOCATION_DISABLED'
    | 'BROWSER_NOT_SUPPORTED'
    | null;

export function useGeofence(targetLocation?: Location, maxDistance: number = DEFAULT_MAX_DISTANCE) {
    const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<LocationErrorType>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkLocation = () => {
        if (!navigator.geolocation) {
            setError('Tarayıcınız konum servisini desteklemiyor.');
            setErrorType('BROWSER_NOT_SUPPORTED');
            setIsWithinRange(false);
            return;
        }

        setIsChecking(true);
        setError(null);
        setErrorType(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                // If no target location, allow (for testing)
                if (!targetLocation) {
                    setIsWithinRange(true);
                    setIsChecking(false);
                    return;
                }

                // CRITICAL: Calculate real distance
                const dist = getDistance(userLocation, targetLocation);
                setDistance(dist);

                if (dist <= maxDistance) {
                    setIsWithinRange(true);
                    setError(null);
                    setErrorType(null);
                } else {
                    // TOO FAR!
                    setIsWithinRange(false);
                    setError(`Restorandan çok uzaktasınız (${dist}m). Sipariş vermek için restoranda olmalısınız.`);
                    setErrorType('TOO_FAR');
                }
                setIsChecking(false);
            },
            (err) => {
                setIsChecking(false);
                setIsWithinRange(false);

                if (err.code === 1) {
                    // PERMISSION_DENIED
                    setError('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini açın.');
                    setErrorType('PERMISSION_DENIED');
                } else if (err.code === 2) {
                    // POSITION_UNAVAILABLE - Usually means location is OFF
                    setError('Konum servisleri kapalı. Lütfen cihazınızın konum ayarlarını açın.');
                    setErrorType('LOCATION_DISABLED');
                } else if (err.code === 3) {
                    // TIMEOUT
                    setError('Konum alınırken zaman aşımı. Tekrar deneyin.');
                    setErrorType('POSITION_UNAVAILABLE');
                } else {
                    setError('Konum alınamadı. Lütfen konum ayarlarınızı kontrol edin.');
                    setErrorType('POSITION_UNAVAILABLE');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0 // Always get fresh location
            }
        );
    };

    const requestPermission = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setError('Tarayıcınız konum servisini desteklemiyor.');
                setErrorType('BROWSER_NOT_SUPPORTED');
                resolve(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                () => {
                    localStorage.setItem('locationPermissionAsked', 'true');
                    localStorage.setItem('locationPermissionGranted', 'true');
                    checkLocation();
                    resolve(true);
                },
                (err) => {
                    localStorage.setItem('locationPermissionAsked', 'true');
                    localStorage.setItem('locationPermissionGranted', 'false');

                    if (err.code === 1) {
                        setError('Konum izni reddedildi.');
                        setErrorType('PERMISSION_DENIED');
                    } else if (err.code === 2) {
                        setError('Konum servisleri kapalı. Lütfen cihazınızın konum ayarlarını açın.');
                        setErrorType('LOCATION_DISABLED');
                    }
                    resolve(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    const hasAskedPermission = typeof window !== 'undefined'
        ? localStorage.getItem('locationPermissionAsked') === 'true'
        : false;

    useEffect(() => {
        // Initial check
        checkLocation();

        // Monitor permission changes
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionStatus(result.state);
                result.onchange = () => {
                    setPermissionStatus(result.state);
                    checkLocation();
                };
            });
        }

        // Recheck location every 30 seconds (security)
        const interval = setInterval(() => {
            if (permissionStatus === 'granted') {
                checkLocation();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [targetLocation]);

    return {
        isWithinRange,
        distance,
        error,
        errorType,
        isChecking,
        checkLocation,
        permissionStatus,
        requestPermission,
        hasAskedPermission
    };
}
