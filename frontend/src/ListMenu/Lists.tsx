interface ListsProps {
  name: string;
  price: number;
  imgUrl: string;
}
import './listcss.css'
const Lists = ({ name, price, imgUrl }: ListsProps) => {

  return (
    <figure className='product'>
      <img src={imgUrl} alt={name} />
      <h2> {name}</h2>
      <h3> Rs {price}</h3>
      <button>Add to Cart</button>
    </figure>
  );
};

export default Lists;
