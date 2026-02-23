import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const TRACKING_STEPS = ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'] as const;
type TrackingStatus = typeof TRACKING_STEPS[number];

interface OrderItem {
    id: number;
    name: string;
    price: number;
    imgUrl: string;
    quantity: number;
}

interface Order {
    _id: string;
    userEmail: string;
    userName: string;
    items: OrderItem[];
    total: number;
    paymentMethod: 'online' | 'cod';
    address: string;
    status: TrackingStatus;
    createdAt: string;
}

const StatusBadge = ({ method }: { method: 'online' | 'cod' }) => (
    method === 'online'
        ? <span className="oh-badge oh-badge--online">✅ Paid Online</span>
        : <span className="oh-badge oh-badge--cod">🚚 Pay on Delivery</span>
);

const TrackingTimeline = ({ status }: { status: TrackingStatus }) => {
    const currentStep = TRACKING_STEPS.indexOf(status);
    return (
        <div className="oh-timeline">
            {TRACKING_STEPS.map((step, i) => (
                <div key={step} className="oh-timeline-item">
                    <div className={`oh-timeline-dot ${i <= currentStep ? 'oh-timeline-dot--done' : ''} ${i === currentStep ? 'oh-timeline-dot--active' : ''}`}>
                        {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`oh-timeline-label ${i <= currentStep ? 'oh-timeline-label--done' : ''}`}>{step}</span>
                    {i < TRACKING_STEPS.length - 1 && (
                        <div className={`oh-timeline-line ${i < currentStep ? 'oh-timeline-line--done' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/order/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to fetch orders');
                const data = await res.json();
                setOrders(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, currentStatus: TrackingStatus) => {
        const currentIndex = TRACKING_STEPS.indexOf(currentStatus);
        const nextStatus = TRACKING_STEPS[currentIndex + 1] ?? 'Delivered';

        setUpdatingId(orderId);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/order/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            const updated: Order = await res.json();
            setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        } catch (err) {
            alert('Could not update order status. Please try again.');
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="oh-page">
                <div className="oh-loading">
                    <div className="oh-spinner" />
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="oh-page">
                <div className="oh-error-box">
                    <p>❌ {error}</p>
                    <button onClick={() => navigate('/')}>Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="oh-page">
            <div className="oh-container">
                {/* Header */}
                <div className="oh-header">
                    <button className="oh-back-btn" onClick={() => navigate('/')}>← Home</button>
                    <div>
                        <h1 className="oh-title">📦 My Orders</h1>
                        <p className="oh-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="oh-empty">
                        <div className="oh-empty-icon">🛒</div>
                        <h2>No orders yet</h2>
                        <p>You haven't placed any orders. Start shopping!</p>
                        <button className="oh-shop-btn" onClick={() => navigate('/')}>Shop Now →</button>
                    </div>
                ) : (
                    <div className="oh-list">
                        {orders.map((order) => {
                            const orderId = order._id.slice(-8).toUpperCase();
                            const date = new Date(order.createdAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            });
                            const isDelivered = order.status === 'Delivered';
                            const nextLabel = TRACKING_STEPS[TRACKING_STEPS.indexOf(order.status) + 1];
                            return (
                                <div key={order._id} className="oh-card">
                                    {/* Card Header */}
                                    <div className="oh-card-header">
                                        <div>
                                            <span className="oh-order-id">Order #{orderId}</span>
                                            <span className="oh-order-date">{date}</span>
                                        </div>
                                        <StatusBadge method={order.paymentMethod} />
                                    </div>

                                    {/* Tracking Timeline */}
                                    <TrackingTimeline status={order.status} />

                                    {/* Dev: Advance Status Button */}
                                    <div className="oh-dev-bar">
                                        <span className="oh-dev-label">🛠️ Dev Mode</span>
                                        {isDelivered ? (
                                            <span className="oh-delivered-badge">✅ Delivered</span>
                                        ) : (
                                            <button
                                                className="oh-advance-btn"
                                                disabled={updatingId === order._id}
                                                onClick={() => updateOrderStatus(order._id, order.status)}
                                            >
                                                {updatingId === order._id
                                                    ? '⏳ Updating…'
                                                    : `→ Mark as "${nextLabel}"`}
                                            </button>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div className="oh-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="oh-item">
                                                {item.imgUrl && (
                                                    <img src={item.imgUrl} alt={item.name} className="oh-item-img" />
                                                )}
                                                <div className="oh-item-info">
                                                    <p className="oh-item-name">{item.name}</p>
                                                    <p className="oh-item-qty">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="oh-item-price">Rs {item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="oh-card-footer">
                                        <div className="oh-address">
                                            <span>📍</span>
                                            <span>{order.address}</span>
                                        </div>
                                        <div className="oh-total">
                                            <span>Total:</span>
                                            <strong>Rs {order.total}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
