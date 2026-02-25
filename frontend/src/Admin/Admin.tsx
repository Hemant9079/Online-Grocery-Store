import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { invalidateDynamicProductsCache } from '../hooks/useDynamicProducts';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

interface DBProduct {
    _id: string;
    name: string;
    price: number;
    imgUrl: string;
    category: string;
    createdAt: string;
}

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface DBOrder {
    _id: string;
    userName: string;
    userEmail: string;
    items: OrderItem[];
    total: number;
    paymentMethod: 'online' | 'cod';
    address: string;
    status: string;
    createdAt: string;
}

const CATEGORIES = ['Dairy', 'Snakes', 'ColdDrinks', 'Wine', 'Smoking'];
const ORDER_STATUSES = ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'];
const STATUS_COLORS: Record<string, string> = {
    'Order Placed':     '#3b82f6',
    'Processing':       '#f97316',
    'Out for Delivery': '#8b5cf6',
    'Delivered':        '#16a34a',
};

const Admin = () => {
    const { currentUser, isAdmin, logout } = useCart();
    const navigate = useNavigate();

    // Tab
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [category, setCategory] = useState('Dairy');
    const [adding, setAdding] = useState(false);
    const [addMsg, setAddMsg] = useState('');
    const [addErr, setAddErr] = useState('');

    // Product list
    const [products, setProducts] = useState<DBProduct[]>([]);
    const [loading, setLoading] = useState(true);

    // Orders
    const [orders, setOrders] = useState<DBOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    // Guard: non-admin redirect
    useEffect(() => {
        if (!isAdmin) navigate('/login', { replace: true });
    }, [isAdmin, navigate]);

    const getToken = () => sessionStorage.getItem('token');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/products`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setProducts(await res.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/orders`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setOrders(await res.json());
        } catch { /* ignore */ }
        finally { setOrdersLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !price || !imgUrl.trim()) { setAddErr('All fields are required.'); return; }
        setAdding(true); setAddErr(''); setAddMsg('');
        try {
            const res = await fetch(`${API_URL}/api/admin/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ name, price: Number(price), imgUrl, category }),
            });
            const data = await res.json();
            if (res.ok) {
                setAddMsg(`✅ "${data.product.name}" added to ${category}!`);
                setName(''); setPrice(''); setImgUrl(''); setCategory('Dairy');
                invalidateDynamicProductsCache();
                fetchProducts();
            } else { setAddErr(data.message || 'Failed to add product.'); }
        } catch { setAddErr('Network error. Please try again.'); }
        finally { setAdding(false); }
    };

    const handleDelete = async (id: string, pName: string) => {
        if (!confirm(`Delete "${pName}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { invalidateDynamicProductsCache(); fetchProducts(); }
        } catch { /* ignore */ }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setStatusUpdating(orderId);
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert('Failed to update order status.');
            }
        } catch { alert('Network error.'); }
        finally { setStatusUpdating(null); }
    };

    const catCounts = CATEGORIES.reduce((acc, c) => {
        acc[c] = products.filter(p => p.category === c).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <span className="admin-header-icon">🛡️</span>
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Logged in as <strong>{currentUser?.username}</strong> · {currentUser?.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="admin-tabs">
                        <button
                            className={`admin-tab-btn${activeTab === 'products' ? ' active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >📦 Products</button>
                        <button
                            className={`admin-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >🛒 Orders</button>
                    </div>
                    <button className="admin-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
                <div className="admin-body">
                    {/* LEFT — Add Product Form */}
                    <div className="admin-card">
                        <h2 className="admin-card-title">➕ Add New Product</h2>
                        <form className="admin-form" onSubmit={handleAdd}>
                            <div className="admin-field">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mango Juice"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="admin-field">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 80"
                                    min="1"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="admin-field">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imgUrl}
                                    onChange={e => setImgUrl(e.target.value)}
                                />
                                {imgUrl && (
                                    <img src={imgUrl} alt="preview" className="admin-preview"
                                        onError={e => (e.currentTarget.style.display = 'none')}
                                        onLoad={e => (e.currentTarget.style.display = 'block')}
                                    />
                                )}
                            </div>
                            <div className="admin-field">
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            {addErr && <p className="admin-error">{addErr}</p>}
                            {addMsg && <p className="admin-success">{addMsg}</p>}
                            <button className="admin-submit-btn" type="submit" disabled={adding}>
                                {adding ? '⏳ Adding…' : '🚀 Add Product'}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT — Products Table */}
                    <div className="admin-card">
                        <h2 className="admin-card-title">📦 Products Added by Admin ({products.length})</h2>
                        <div className="admin-stats">
                            {CATEGORIES.map(c => (
                                <div key={c} className="admin-stat">
                                    <div className="admin-stat-num">{catCounts[c] || 0}</div>
                                    <div className="admin-stat-label">{c}</div>
                                </div>
                            ))}
                        </div>
                        {loading ? (
                            <p className="admin-loading">⏳ Loading products…</p>
                        ) : products.length === 0 ? (
                            <p className="admin-empty">No products added yet. Use the form to add your first product!</p>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Category</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p._id}>
                                                <td>
                                                    <img src={p.imgUrl} alt={p.name} className="admin-product-thumb"
                                                        onError={e => (e.currentTarget.src = 'https://placehold.co/46x46/1a2e1c/4ade80?text=IMG')}
                                                    />
                                                </td>
                                                <td>{p.name}</td>
                                                <td>₹{p.price}</td>
                                                <td><span className="admin-cat-badge">{p.category}</span></td>
                                                <td>
                                                    <button
                                                        className="admin-delete-btn"
                                                        onClick={() => handleDelete(p._id, p.name)}
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
                <div className="admin-body admin-body--full">
                    <div className="admin-card" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className="admin-card-title" style={{ margin: 0 }}>🛒 All Orders ({orders.length})</h2>
                            <button className="admin-submit-btn" style={{ width: 'auto', padding: '8px 18px' }} onClick={fetchOrders} disabled={ordersLoading}>
                                {ordersLoading ? '⏳ Loading…' : '🔄 Refresh'}
                            </button>
                        </div>
                        {ordersLoading ? (
                            <p className="admin-loading">⏳ Loading orders…</p>
                        ) : orders.length === 0 ? (
                            <p className="admin-empty">No orders yet.</p>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Email</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Address</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, idx) => (
                                            <tr key={order._id}>
                                                <td style={{ color: '#888', fontSize: '12px' }}>{idx + 1}</td>
                                                <td><strong>{order.userName}</strong></td>
                                                <td style={{ fontSize: '12px' }}>{order.userEmail}</td>
                                                <td>
                                                    <span title={order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}>
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td><strong>₹{order.total}</strong></td>
                                                <td>
                                                    <span style={{
                                                        background: order.paymentMethod === 'online' ? '#dbeafe' : '#fef9c3',
                                                        color: order.paymentMethod === 'online' ? '#1d4ed8' : '#854d0e',
                                                        borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 600
                                                    }}>
                                                        {order.paymentMethod === 'online' ? '💳 Online' : '💵 COD'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                    title={order.address}>
                                                    {order.address}
                                                </td>
                                                <td>
                                                    <select
                                                        value={order.status}
                                                        disabled={statusUpdating === order._id}
                                                        onChange={e => handleStatusChange(order._id, e.target.value)}
                                                        style={{
                                                            border: `2px solid ${STATUS_COLORS[order.status] || '#ccc'}`,
                                                            borderRadius: '8px',
                                                            padding: '4px 8px',
                                                            fontWeight: 600,
                                                            color: STATUS_COLORS[order.status] || '#333',
                                                            background: '#fff',
                                                            cursor: statusUpdating === order._id ? 'wait' : 'pointer',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {ORDER_STATUSES.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
