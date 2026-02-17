import './listcss.css'
import { useCart } from '../context/CartContext';

interface ListsProps {
  id: number;
  name: string;
  price: number;
  imgUrl: string;
}

const Lists = ({ id, name, price, imgUrl }: ListsProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, name, price, imgUrl });
  };

  return (
    <figure className='product'>
      <img src={imgUrl} alt={name} />
      <h2> {name}</h2>
      <h3> Rs {price}</h3>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </figure>
  );
};

export default Lists;
