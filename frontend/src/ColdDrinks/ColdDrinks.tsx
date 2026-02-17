import Lists from '../ListMenu/Lists';
import { allProducts } from '../data/products';
import '../Snakes/Snakes.css';

const ColdDrinks = () => {
    const products = allProducts.filter(p => p.category === 'ColdDrinks');

    return (
        <div className="conveyor-container">
            <h3>Cold Drinks</h3>
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

export default ColdDrinks;