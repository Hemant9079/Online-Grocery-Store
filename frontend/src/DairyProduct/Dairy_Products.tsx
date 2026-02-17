import Lists from '../ListMenu/Lists.tsx';
import { allProducts } from '../data/products';

const Dairy_Products = () => {
  const products = allProducts.filter(p => p.category === 'Dairy');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {products.map((product) => (
        <Lists
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          imgUrl={product.imgUrl}
        />
      ))}
    </div>
  );
};

export default Dairy_Products;
