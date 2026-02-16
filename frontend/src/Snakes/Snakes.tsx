import { useState } from 'react';
import Lists from '../ListMenu/Lists.tsx';
import comboSnacks from './imgs/combo of snakes.jpg';
import devSnacks from './imgs/dev sankes.jpg';
import kurkure from './imgs/kurkure.jpg';
import nuts from './imgs/nuts.jpg';
import partySnacks from './imgs/party snacks.jpg';
import popcorn from './imgs/popcorn.jpg';
import superCheesy from './imgs/super cheesy.jpg';
import tasty from './imgs/tasty.jpg';

import './Snakes.css';

const Snakes = () => {
    const [products] = useState([
        { id: 1, name: 'Combo of Snacks', price: 150, imgUrl: comboSnacks },
        { id: 2, name: 'Dev Snacks', price: 40, imgUrl: devSnacks },
        { id: 3, name: 'Kurkure', price: 20, imgUrl: kurkure },
        { id: 4, name: 'Nuts', price: 200, imgUrl: nuts },
        { id: 5, name: 'Party Snacks', price: 100, imgUrl: partySnacks },
        { id: 6, name: 'Popcorn', price: 30, imgUrl: popcorn },
        { id: 7, name: 'Super Cheesy', price: 50, imgUrl: superCheesy },
        { id: 8, name: 'Tasty', price: 60, imgUrl: tasty },
    ]);

    return (
        <div className="conveyor-container">
            <h3>Snakes</h3>
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

export default Snakes