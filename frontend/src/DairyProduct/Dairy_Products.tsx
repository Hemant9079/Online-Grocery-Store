import { useState } from 'react';
import Lists from '../ListMenu/Lists.tsx';

import amulMilkRed from './img/amulmilkred.webp';
import amulMilkBrown from './img/amulmilkbrown.jpg';
import amulCurd from './img/amulcurd.jpg';
import amulMilk1kg from './img/amulmilk1kg.jpg';
import amulCurdBlue from './img/amulcurdblue.webp';
import amulLassiWhite from './img/amullasiwhite.jpg';
import amulLassiYellow from './img/amullasiyello.jpg';

const Dairy_Products = () => {
  const [products] = useState([
    { id: 1, name: 'Amul Milk', price: 60, imgUrl: amulMilkRed },
    { id: 2, name: 'Amul Milk', price: 250, imgUrl: amulMilkBrown },
    { id: 3, name: 'Amul Curd', price: 90, imgUrl: amulCurd },
    { id: 4, name: 'Amul Milk', price: 40, imgUrl: amulMilk1kg },
    { id: 5, name: 'Amul Curd (Blue)', price: 30, imgUrl: amulCurdBlue },
    { id: 6, name: 'Amul Lassi (White)', price: 20, imgUrl: amulLassiWhite },
    { id: 7, name: 'Amul Lassi (Yellow)', price: 25, imgUrl: amulLassiYellow },
  ]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {products.map((product) => (
        <Lists
          key={product.id}
          name={product.name}
          price={product.price}
          imgUrl={product.imgUrl}
        />
      ))}
    </div>
  );
};

export default Dairy_Products;
