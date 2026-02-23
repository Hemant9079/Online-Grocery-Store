import Lists from '../ListMenu/Lists.tsx';
import { allProducts } from '../data/products';
import { useDynamicProducts, invalidateDynamicProductsCache } from '../hooks/useDynamicProducts';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const Snakes_Products = () => {
    const { isAdmin } = useCart();
    const staticProducts = allProducts.filter(p => p.category === 'Snacks');
    const { products: dynamic } = useDynamicProducts('Snacks');

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
            {all.map((product, index) => (
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
    );
};

export default Snakes_Products;
