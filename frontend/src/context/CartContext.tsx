import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    imgUrl: string;
    quantity: number;
}

interface CurrentUser {
    username: string;
    email: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    logout: () => void;
    cartCount: number;
    cartTotal: number;
    isLoggedIn: boolean;
    currentUser: CurrentUser | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const getStoredUser = (): CurrentUser | null => {
    try {
        const raw = sessionStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const u = parsed?.user ?? parsed;
        if (u?.username) return { username: u.username, email: u.email };
        return null;
    } catch { return null; }
};

const getToken = () => sessionStorage.getItem('token');

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(getStoredUser);
    const navigate = useNavigate();

    // Load cart from server for the current user
    const loadCartFromServer = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${getApiUrl()}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.cart ?? []);
                setCartItems(items);
            }
        } catch (err) {
            console.error('Failed to load cart:', err);
        }
    }, []);

    // Save cart to server
    const saveCartToServer = useCallback(async (items: CartItem[]) => {
        const token = getToken();
        if (!token) return;
        try {
            await fetch(`${getApiUrl()}/api/cart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cart: items }),
            });
        } catch (err) {
            console.error('Failed to save cart:', err);
        }
    }, []);

    // On mount / isLoggedIn change → load this user's cart
    useEffect(() => {
        if (isLoggedIn) {
            setCurrentUser(getStoredUser());
            loadCartFromServer();
        } else {
            setCurrentUser(null);
            setCartItems([]);
        }
    }, [isLoggedIn, loadCartFromServer]);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            const updated = existing
                ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...product, quantity: 1 }];
            saveCartToServer(updated);
            return updated;
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => {
            const updated = prev.filter(i => i.id !== id);
            saveCartToServer(updated);
            return updated;
        });
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) { removeFromCart(id); return; }
        setCartItems(prev => {
            const updated = prev.map(i => i.id === id ? { ...i, quantity } : i);
            saveCartToServer(updated);
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        saveCartToServer([]);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setCartItems([]);
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/login');
    };

    // Expose a login trigger used by Login.tsx after successful auth
    // (Login.tsx sets sessionStorage then calls window.dispatchEvent)
    useEffect(() => {
        const onLoginEvent = () => {
            setIsLoggedIn(!!getToken());
        };
        window.addEventListener('user-logged-in', onLoginEvent);
        return () => window.removeEventListener('user-logged-in', onLoginEvent);
    }, []);

    const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
    const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity,
            clearCart, logout, cartCount, cartTotal, isLoggedIn, currentUser,
        }}>
            {children}
        </CartContext.Provider>
    );
};
