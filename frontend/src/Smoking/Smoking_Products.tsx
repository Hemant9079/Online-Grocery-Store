import Lists from '../ListMenu/Lists.tsx';
import { allProducts } from '../data/products';
import { useDynamicProducts, invalidateDynamicProductsCache } from '../hooks/useDynamicProducts';
import { useCart } from '../context/CartContext';
import API_URL from '../config';

const Smoking_Products = () => {
    const { isAdmin } = useCart();
    const staticProducts = allProducts.filter(p => p.category === 'Smoking');
    const { products: dynamic } = useDynamicProducts('Smoking');

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

export default Smoking_Products;
