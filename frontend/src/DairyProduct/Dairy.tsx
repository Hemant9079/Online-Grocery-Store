// ...existing code...
import './diary.css';
import dairyImage from './dairyimg.png';
import { useNavigate } from 'react-router-dom';

import Snakes from '../Snakes/Snakes';
import ColdDrinks from '../ColdDrinks/ColdDrinks';

const Dairy = () => {
  const navigate = useNavigate();

  const dairyContainerStyle = {
    backgroundImage: `url(${dairyImage})`
  };

  return (
    <>
      <div className="dairy-container" style={dairyContainerStyle}>
        <h1>Stocks of daily essentials </h1>
        <h3>Get fresh dairy products , eggs ,  fruits ands vegetables</h3>
        <button onClick={() => navigate("/Dairy-products")}>View Products</button>
      </div>
      <Snakes />
      <ColdDrinks />
    </>
  );
};

export default Dairy;