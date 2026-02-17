import Lists from '../ListMenu/Lists.tsx';
import { allProducts } from '../data/products';
import './Snakes.css';

const Snakes = () => {
    const products = allProducts.filter(p => p.category === 'Snacks');

    return (
        <div className="conveyor-container">
            <h3>Snakes</h3>
            <div className="conveyor-track">
                {/* Duplicate the list to create a seamless loop effect */}
                {[...products, ...products].map((product, index) => (
                    <Lists
                        key={`${product.id}-${index}`}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        imgUrl={product.imgUrl}
                    />
                ))}
            </div>
        </div>
    )
}

export default Snakes