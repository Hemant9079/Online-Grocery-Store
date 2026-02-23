import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const OrderConfirm = () => {
    const { cartItems, cartTotal, clearCart, currentUser, locationAddress } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const user = currentUser || JSON.parse(sessionStorage.getItem('user') || '{}');
    const [address, setAddress] = useState(locationAddress || '');
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>(
        (location.state as { paymentMethod?: 'online' | 'cod' })?.paymentMethod || 'online'
    );
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!address.trim()) {
            setError('Please enter your delivery address.');
            return;
        }
        setError('');
        setSending(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/order/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems,
                    total: cartTotal,
                    paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
                    address,
                    userEmail: user.email,
                    userName: user.username || user.name,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                clearCart();
            } else {
                setError(data.message || 'Something went wrong.');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Network error';
            setError(`Failed to send confirmation: ${msg}`);
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="oc-success">
                <div className="oc-success-card">
                    <div className="oc-success-icon">✅</div>
                    <h1>Order Confirmed!</h1>
                    <p>Your bill has been sent to <strong>{user.email}</strong></p>
                    <p className="oc-success-sub">Check your inbox for the receipt.</p>
                    <button className="oc-home-btn" onClick={() => navigate('/')}>
                        Continue Shopping →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="oc-page">
            <div className="oc-container">
                {/* Header */}
                <div className="oc-header">
                    <span className="oc-header-icon">🛒</span>
                    <div>
                        <h1>Order Confirmation</h1>
                        <p>Review your order before we send the bill</p>
                    </div>
                </div>

                <div className="oc-grid">
                    {/* LEFT: Details */}
                    <div className="oc-left">
                        {/* User Info */}
                        <div className="oc-card">
                            <h2 className="oc-card-title">👤 Your Details</h2>
                            <div className="oc-info-row">
                                <span className="oc-info-label">Name</span>
                                <span className="oc-info-value">{user.username || user.name || '—'}</span>
                            </div>
                            <div className="oc-info-row">
                                <span className="oc-info-label">Email</span>
                                <span className="oc-info-value">{user.email || '—'}</span>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="oc-card">
                            <h2 className="oc-card-title">📍 Delivery Address</h2>
                            <textarea
                                className="oc-textarea"
                                placeholder="Enter your full delivery address (house no., street, city, pincode)..."
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="oc-card">
                            <h2 className="oc-card-title">💳 Payment Method</h2>
                            <div className="oc-payment-options">
                                <label className={`oc-payment-opt ${paymentMethod === 'online' ? 'oc-payment-opt--active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={() => setPaymentMethod('online')}
                                    />
                                    <span className="oc-payment-icon">✅</span>
                                    <div>
                                        <strong>Paid Online</strong>
                                        <p>Payment completed via Razorpay</p>
                                    </div>
                                </label>
                                <label className={`oc-payment-opt ${paymentMethod === 'cod' ? 'oc-payment-opt--active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <span className="oc-payment-icon">🚚</span>
                                    <div>
                                        <strong>Pay on Delivery</strong>
                                        <p>Pay when your order arrives</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="oc-right">
                        <div className="oc-card oc-summary-card">
                            <h2 className="oc-card-title">🧾 Order Summary</h2>
                            <div className="oc-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="oc-item">
                                        <img src={item.imgUrl} alt={item.name} className="oc-item-img" />
                                        <div className="oc-item-info">
                                            <p className="oc-item-name">{item.name}</p>
                                            <p className="oc-item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="oc-item-price">Rs {item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="oc-total">
                                <span>Total Amount</span>
                                <strong>Rs {cartTotal}</strong>
                            </div>

                            {error && <p className="oc-error">{error}</p>}

                            <button
                                className="oc-confirm-btn"
                                onClick={handleConfirm}
                                disabled={sending}
                            >
                                {sending ? '⏳ Sending...' : '📧 Confirm & Send Bill to Email'}
                            </button>
                            <button className="oc-back-btn" onClick={() => navigate('/cart')}>
                                ← Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirm;
