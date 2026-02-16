import { useState } from 'react';
import Lists from '../ListMenu/Lists';
import cocaCola from './imgs/coca cola.jpg';
import dietCoke from './imgs/diet coke.jpg';
import fanta from './imgs/fanta.jpg';
import lemonWater from './imgs/lemon water.jpg';
import marinda from './imgs/marinda.avif';
import mojito from './imgs/mojito.webp';
import pepsi from './imgs/pepsi.jpg';
import spriteCane from './imgs/sprite cane.jpg';
import sprite from './imgs/sprite.jpg';
import thumsUp from './imgs/thums Up.webp';

import '../Snakes/Snakes.css';

const ColdDrinks = () => {
    const [products] = useState([
        { id: 1, name: 'Coca Cola', price: 40, imgUrl: cocaCola },
        { id: 2, name: 'Diet Coke', price: 50, imgUrl: dietCoke },
        { id: 3, name: 'Fanta', price: 45, imgUrl: fanta },
        { id: 4, name: 'Lemon Water', price: 20, imgUrl: lemonWater },
        { id: 5, name: 'Marinda', price: 45, imgUrl: marinda },
        { id: 6, name: 'Mojito', price: 80, imgUrl: mojito },
        { id: 7, name: 'Pepsi', price: 40, imgUrl: pepsi },
        { id: 8, name: 'Sprite Cane', price: 50, imgUrl: spriteCane },
        { id: 9, name: 'Sprite', price: 40, imgUrl: sprite },
        { id: 10, name: 'Thums Up', price: 45, imgUrl: thumsUp },
    ]);

    return (
        <div className="conveyor-container">
            <h3>Cold Drinks</h3>
            <div className="conveyor-track">
                {/* Duplicate the list to create a seamless loop effect */}
                {[...products, ...products].map((product, index) => (
                    <Lists
                        key={`${product.id}-${index}`}
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