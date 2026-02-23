import { useState } from 'react';
import { invalidateDynamicProductsCache } from '../hooks/useDynamicProducts';
import './AdminPanel.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const CATEGORIES = ['Dairy', 'Snacks', 'ColdDrinks', 'Wine', 'Smoking'];

interface Props {
    onClose: () => void;
    onProductAdded: () => void;
}

const AdminPanel = ({ onClose, onProductAdded }: Props) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [category, setCategory] = useState('Dairy');
    const [adding, setAdding] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const getToken = () => sessionStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !price || !imgUrl.trim()) {
            setErr('All fields are required.');
            return;
        }
        setAdding(true); setErr(''); setMsg('');
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
                setMsg(`✅ "${data.product.name}" added to ${category}!`);
                setName(''); setPrice(''); setImgUrl(''); setCategory('Dairy');
                invalidateDynamicProductsCache();
                onProductAdded(); // tell parent to refresh
            } else {
                setErr(data.message || 'Failed to add product.');
            }
        } catch { setErr('Network error. Please try again.'); }
        finally { setAdding(false); }
    };

    return (
        <>
            {/* Overlay */}
            <div className="admin-panel-overlay" onClick={onClose} />

            {/* Drawer */}
            <div className="admin-panel-drawer">
                <div className="admin-panel-header">
                    <h2>🛡️ Add Product</h2>
                    <button className="admin-panel-close" onClick={onClose}>✕</button>
                </div>

                <form className="admin-panel-body" onSubmit={handleSubmit}>
                    <div className="ap-field">
                        <label>Product Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Mango Juice"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="ap-field">
                        <label>Price (₹)</label>
                        <input
                            type="number"
                            placeholder="e.g. 80"
                            min="1"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="ap-field">
                        <label>Image URL</label>
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={imgUrl}
                            onChange={e => setImgUrl(e.target.value)}
                        />
                        {imgUrl && (
                            <img
                                src={imgUrl}
                                alt="preview"
                                className="ap-preview"
                                onError={e => (e.currentTarget.style.display = 'none')}
                                onLoad={e => (e.currentTarget.style.display = 'block')}
                            />
                        )}
                    </div>

                    <div className="ap-field">
                        <label>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {err && <p className="ap-msg-err">{err}</p>}
                    {msg && <p className="ap-msg-ok">{msg}</p>}

                    <button className="ap-submit" type="submit" disabled={adding}>
                        {adding ? '⏳ Adding…' : '🚀 Add to Store'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AdminPanel;
