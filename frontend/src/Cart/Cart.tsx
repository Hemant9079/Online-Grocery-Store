import { useCart } from '../context/CartContext';
// import './Cart.css'; // You can create a CSS file for styling

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Your cart is empty</h2></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>My Cart</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '20px', border: '1px solid #ddd', padding: '10px', alignItems: 'center' }}>
                        <img src={item.imgUrl} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <h3>{item.name}</h3>
                            <p>Price: Rs {item.price}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ padding: '5px 10px' }}
                            >-</button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ padding: '5px 10px' }}
                            >+</button>
                        </div>
                        <p>Total: Rs {item.price * item.quantity}</p>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ backgroundColor: '#ff4444', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}
                        >Remove</button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <h2>Total Amount: Rs {cartTotal}</h2>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={clearCart}
                        style={{ padding: '10px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '5px' }}
                    >Clear Cart</button>
                    <button
                        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
                    >Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
