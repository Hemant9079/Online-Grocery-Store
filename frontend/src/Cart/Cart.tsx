import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Extend Window type for Razorpay
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => { open: () => void };
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    method?: {
        upi?: boolean;
        card?: boolean;
        netbanking?: boolean;
        wallet?: boolean;
    };
    handler: (response: { razorpay_payment_id: string }) => void;
    theme: { color: string };
}

const RAZORPAY_KEY_ID = 'rzp_test_SJ1piYlFgtlvBS';
import API_URL from '../config';

const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) { resolve(true); return; }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, currentUser } = useCart();
    const [paying, setPaying] = useState(false);
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (cartItems.length === 0) return;

        setPaying(true);
        try {
            // 1. Load Razorpay SDK dynamically
            const loaded = await loadRazorpayScript();
            if (!loaded) { alert('Failed to load payment SDK. Check your connection.'); return; }

            // 2. Create order on server
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: cartTotal }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Could not create payment order.');
                return;
            }

            const order = await res.json();

            // 3. Open Razorpay popup
            const options: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'My Grocery Store 🛒',
                description: 'Order Payment',
                order_id: order.id,
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true,
                },
                handler: (_response) => {
                    // Payment successful — navigate to order confirm to collect address,
                    // save order to DB and send confirmation email
                    navigate('/order-confirm', { state: { paymentMethod: 'online' } });
                },
                theme: { color: '#77c150' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed. Please try again.');
        } finally {
            setPaying(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <h2>🛒 Your cart is empty</h2>
                <p style={{ color: '#888' }}>Add items to get started</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>My Cart</h1>
            {currentUser && (
                <p style={{ color: '#555', marginBottom: '16px' }}>
                    Shopping as <strong>{currentUser.username}</strong>
                </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex', gap: '20px',
                        border: '1px solid #ddd', padding: '12px',
                        borderRadius: '8px', alignItems: 'center'
                    }}>
                        <img src={item.imgUrl} alt={item.name} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0 }}>{item.name}</h3>
                            <p style={{ margin: '4px 0', color: '#555' }}>Rs {item.price} × {item.quantity}</p>
                            <p style={{ margin: 0, fontWeight: 600, color: '#2d6a1f' }}>Rs {item.price * item.quantity}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>−</button>
                            <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)}
                            style={{ backgroundColor: '#ff4444', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Summary + Actions */}
            <div style={{
                marginTop: '28px', padding: '20px',
                background: '#f7f9f6', borderRadius: '10px',
                border: '1px solid #dde8d5'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '18px', color: '#555' }}>Total Amount</span>
                    <strong style={{ fontSize: '22px', color: '#2d6a1f' }}>Rs {cartTotal}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={clearCart}
                        style={{ padding: '10px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Clear Cart
                    </button>

                    {/* Pay on Delivery */}
                    <button
                        onClick={() => navigate('/order-confirm', { state: { paymentMethod: 'cod' } })}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#f97316',
                            color: 'white', border: 'none', borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 700, fontSize: '15px',
                        }}>
                        🚚 Pay on Delivery
                    </button>

                    {/* Pay Online via Razorpay */}
                    <button
                        onClick={handlePayment}
                        disabled={paying}
                        style={{
                            padding: '10px 28px',
                            backgroundColor: paying ? '#aaa' : '#77c150',
                            color: 'white', border: 'none', borderRadius: '6px',
                            cursor: paying ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: '16px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                        {paying ? '⏳ Processing…' : '💳 Pay Now (Rs ' + cartTotal + ')'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
