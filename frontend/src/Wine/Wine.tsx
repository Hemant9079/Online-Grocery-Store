import { useState } from 'react';
import Lists from '../ListMenu/Lists';
import './Wine.css';

import carlsberg from './img/Carlsberg beer.jpg';
import fratelli from './img/Fratelli wine.jpg';
import haywards from './img/Haywards 5000 beer.jpg';
import kingfisher from './img/Kingfisher  beer.jpg';
import york from './img/York wine.jpg';
import budweiser from './img/budweiser bear.avif';
import indri from './img/indri wine.jpg';
import moli from './img/moli wine.jpg';
import pitbull from './img/pitbull wine.jpg';
import turbo from './img/turbo beer.jpg';

const Wine = () => {
    const [products] = useState([
        { id: 1, name: 'Carlsberg Beer', price: 250, imgUrl: carlsberg },
        { id: 2, name: 'Fratelli Wine', price: 600, imgUrl: fratelli },
        { id: 3, name: 'Haywards 5000', price: 180, imgUrl: haywards },
        { id: 4, name: 'Kingfisher Beer', price: 150, imgUrl: kingfisher },
        { id: 5, name: 'York Wine', price: 700, imgUrl: york },
        { id: 6, name: 'Budweiser', price: 220, imgUrl: budweiser },
        { id: 7, name: 'Indri Wine', price: 800, imgUrl: indri },
        { id: 8, name: 'Moli Wine', price: 450, imgUrl: moli },
        { id: 9, name: 'Pitbull Wine', price: 300, imgUrl: pitbull },
        { id: 10, name: 'Turbo Beer', price: 130, imgUrl: turbo },
    ]);

    return (
        <div className="conveyor-container">
            <h3>Best Wines & Beers</h3>
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

export default Wine;