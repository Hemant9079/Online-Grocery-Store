import Lists from '../ListMenu/Lists';
import { allProducts } from '../data/products';
import './Smoking.css';

const Smoking = () => {
    const products = allProducts.filter(p => p.category === 'Smoking');

    return (
        <div className="conveyor-container">
            <h3>Smoking Essentials</h3>
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
    );
};

export default Smoking;