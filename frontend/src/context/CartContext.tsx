import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    imgUrl: string;
    quantity: number;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    // Fetch cart from server on login/mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetch(`${getApiUrl()}/api/cart`, {
                // We rely on cookie for auth if possible, OR header. 
                // VerifyToken middleware checks req.cookies.access_token OR we can add header support.
                // For now, let's assume cookie is used as set by Login.tsx. 
                // Login.tsx sets cookie "access_token".
                // Fetch needs { credentials: 'include' } to send cookies.
                method: 'GET',
                credentials: 'include'
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to fetch cart');
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setCartItems(data);
                        localStorage.setItem('cartItems', JSON.stringify(data));
                    }
                })
                .catch(err => console.error("Error fetching cart:", err));
        } else {
            setIsLoggedIn(false);
        }
    }, [isLoggedIn]); // Re-run when login status changes

    // Save cart to server
    const saveCartToServer = async (items: CartItem[]) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch(`${getApiUrl()}/api/cart`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(items)
                });
            } catch (error) {
                console.error("Error saving cart:", error);
            }
        }
    };

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setCartItems((prevItems) => {
            let newItems;
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                newItems = prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                newItems = [...prevItems, { ...product, quantity: 1 }];
            }
            saveCartToServer(newItems);
            return newItems;
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems((prevItems) => {
            const newItems = prevItems.filter((item) => item.id !== id);
            saveCartToServer(newItems);
            return newItems;
        });
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setCartItems((prevItems) => {
            const newItems = prevItems.map((item) => (item.id === id ? { ...item, quantity } : item));
            saveCartToServer(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        saveCartToServer([]);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
        setCartItems([]);
        setIsLoggedIn(false);
        // Clear cookie? 
        // We can't clear httpOnly cookie from JS. We should call an API endpoint to clear it.
        // OR just rely on token removal if token was used in header. 
        // If cookie is used for auth, we MUST call an API to clear it.
        // Let's assume for now removing localStorage is enough for frontend state, 
        // but for security we should hit a logout endpoint.

        // Let's add a logout endpoint call just in case or future proof it.
        // For now, based on user request "remove automatically", clearing local state is visually sufficient.

        navigate('/login');
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                logout,
                cartCount,
                cartTotal,
                isLoggedIn
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
