import { useParams, useNavigate } from 'react-router-dom';
import { allProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const product = allProducts.find(p => p.id === Number(id));

    if (!product) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Product not found</h2>
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Go Home</button>
            </div>
        );
    }

    const handleAddToCart = () => {
        // Add the item `quantity` times
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        alert(`${quantity} ${product.name}(s) added to cart!`);
    };

    return (
        <div style={{ display: 'flex', padding: '40px', gap: '40px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px', textAlign: 'center' }}>
                <img
                    src={product.imgUrl}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                />
            </div>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#333' }}>{product.name}</h1>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>Category: <span style={{ fontWeight: 'bold' }}>{product.category}</span></p>
                <h2 style={{ fontSize: '2rem', color: '#e63946' }}>Rs {product.price}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{ padding: '5px 15px', fontSize: '1.2rem', cursor: 'pointer' }}
                    >-</button>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{quantity}</span>
                    <button
                        onClick={() => setQuantity(q => q + 1)}
                        style={{ padding: '5px 15px', fontSize: '1.2rem', cursor: 'pointer' }}
                    >+</button>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <button
                        onClick={handleAddToCart}
                        style={{
                            padding: '15px 30px',
                            fontSize: '1.2rem',
                            backgroundColor: '#2a9d8f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Add to Cart
                    </button>
                    <button
                        onClick={() => { handleAddToCart(); navigate('/cart'); }}
                        style={{
                            padding: '15px 30px',
                            fontSize: '1.2rem',
                            backgroundColor: '#e76f51',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        Buy Now
                    </button>
                </div>

                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                    <h3>Product Description</h3>
                    <p>Enjoy the premium quality of {product.name}. Perfect for your daily needs.</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
