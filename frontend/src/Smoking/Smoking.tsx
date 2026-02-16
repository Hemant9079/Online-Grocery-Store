import { useState } from 'react';
import Lists from '../ListMenu/Lists';
import './Smoking.css';

import bidi from './img/Bidi.jpg';
import chhotiAdvance from './img/Chhoti Advance.jpg';
import mallBoro from './img/Mall boro.avif';
import mentholWomen from './img/Menthol Women.jpg';
import pallMall from './img/Pall Mall.jpg';
import royalSwag from './img/Royal Swag Ayurvedic and Herbal.jpg';
import smokyWomen from './img/Smoky for women.jpg';
import stellarMint from './img/Stellar mint.jpg';
import goldFlake from './img/gold Flake.jpg';

const Smoking = () => {
    const [products] = useState([
        { id: 1, name: 'Bidi', price: 50, imgUrl: bidi },
        { id: 2, name: 'Chhoti Advance', price: 120, imgUrl: chhotiAdvance },
        { id: 3, name: 'Marlboro', price: 350, imgUrl: mallBoro },
        { id: 4, name: 'Menthol for Women', price: 200, imgUrl: mentholWomen },
        { id: 5, name: 'Pall Mall', price: 280, imgUrl: pallMall },
        { id: 6, name: 'Royal Swag (Herbal)', price: 150, imgUrl: royalSwag },
        { id: 7, name: 'Smoky for Women', price: 220, imgUrl: smokyWomen },
        { id: 8, name: 'Stellar Mint', price: 180, imgUrl: stellarMint },
        { id: 9, name: 'Gold Flake', price: 160, imgUrl: goldFlake },
    ]);

    return (
        <div className="conveyor-container">
            <h3>Smoking Essentials</h3>
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
    );
};

export default Smoking;