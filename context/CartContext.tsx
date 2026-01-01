'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string; // Unique ID for cart item (product ID + options)
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    options: string[]; // Selected extras
    note?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    cartNote: string;
    setCartNote: (note: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartNote, setCartNote] = useState<string>('');

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedNote = localStorage.getItem('cartNote');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        if (savedNote) {
            setCartNote(savedNote);
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Save cart note to localStorage on change
    useEffect(() => {
        localStorage.setItem('cartNote', cartNote);
    }, [cartNote]);

    const addToCart = (newItem: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            // Find existing item: MUST match productId, options AND note
            const existingItem = prev.find(item =>
                item.productId === newItem.productId &&
                JSON.stringify(item.options?.sort()) === JSON.stringify(newItem.options?.sort()) &&
                (item.note || '') === (newItem.note || '')
            );

            if (existingItem) {
                // Same product, same options, same note → increase quantity
                return prev.map(item =>
                    item.id === existingItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // Different note or options → new item
            const uniqueId = `${newItem.productId}-${Date.now()}-${Math.random()}`;
            return [...prev, { ...newItem, id: uniqueId }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => {
        setItems([]);
        setCartNote('');
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, cartNote, setCartNote }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
