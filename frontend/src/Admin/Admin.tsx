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

const CATEGORIES = ['Dairy', 'Snakes', 'ColdDrinks', 'Wine', 'Smoking'];

const Admin = () => {
    const { currentUser, isAdmin, logout } = useCart();
    const navigate = useNavigate();

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
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !price || !imgUrl.trim()) {
            setAddErr('All fields are required.');
            return;
        }
        setAdding(true); setAddErr(''); setAddMsg('');
        try {
            const res = await fetch(`${API_URL}/api/admin/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ name, price: Number(price), imgUrl, category }),
            });
            const data = await res.json();
            if (res.ok) {
                setAddMsg(`✅ "${data.product.name}" added to ${category}!`);
                setName(''); setPrice(''); setImgUrl(''); setCategory('Dairy');
                invalidateDynamicProductsCache();
                fetchProducts();
            } else {
                setAddErr(data.message || 'Failed to add product.');
            }
        } catch { setAddErr('Network error. Please try again.'); }
        finally { setAdding(false); }
    };

    const handleDelete = async (id: string, pName: string) => {
        if (!confirm(`Delete "${pName}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { invalidateDynamicProductsCache(); fetchProducts(); }
        } catch { /* ignore */ }
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
                <button className="admin-logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                    Logout
                </button>
            </div>

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

                    {/* Category stats */}
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
        </div>
    );
};

export default Admin;
