import Lists from '../ListMenu/Lists';
import { allProducts } from '../data/products';
import './Wine.css';
import { useDynamicProducts, invalidateDynamicProductsCache } from '../hooks/useDynamicProducts';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Wine = () => {
    const { isAdmin } = useCart();
    const navigate = useNavigate();
    const staticProducts = allProducts.filter(p => p.category === 'Wine');
    const { products: dynamic } = useDynamicProducts('Wine');

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await fetch(`${API_URL}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        });
        invalidateDynamicProductsCache();
        window.location.reload();
    };

    const staticMapped = staticProducts.map(p => ({ id: p.id, name: p.name, price: p.price, imgUrl: p.imgUrl, dynId: undefined as string | undefined }));
    const dynamicMapped = dynamic.map(p => ({ id: p._id, name: p.name, price: p.price, imgUrl: p.imgUrl, dynId: p._id }));
    const all = [...staticMapped, ...dynamicMapped];

    return (
        <div className="conveyor-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
                <h3>Best Wines &amp; Beers</h3>
                <button onClick={() => navigate('/wine-products')} style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    View Products
                </button>
            </div>
            <div className="conveyor-track">
                {[...all, ...all].map((product, index) => (
                    <Lists
                        key={`${product.id}-${index}`}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        imgUrl={product.imgUrl}
                        onDelete={isAdmin && product.dynId ? () => handleDelete(product.dynId!) : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default Wine;