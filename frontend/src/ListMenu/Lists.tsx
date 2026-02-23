import './listcss.css';
import { useCart } from '../context/CartContext';

interface ListsProps {
  id: number | string;
  name: string;
  price: number;
  imgUrl: string;
  onDelete?: () => void;  // Only passed for admin-deletable (dynamic) products
}

const Lists = ({ id, name, price, imgUrl, onDelete }: ListsProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id: id as number, name, price, imgUrl });
  };

  return (
    <figure className='product' style={{ position: 'relative' }}>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Delete product (admin)"
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(220,38,38,0.85)', color: '#fff',
            border: 'none', borderRadius: '50%',
            width: 26, height: 26, fontSize: '0.85rem',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'background 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#dc2626')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.85)')}
        >
          ✕
        </button>
      )}
      <img src={imgUrl} alt={name} />
      <h2>{name}</h2>
      <h3>Rs {price}</h3>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </figure>
  );
};

export default Lists;
