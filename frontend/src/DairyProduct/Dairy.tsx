// ...existing code...
import './diary.css';
import dairyImage from './dairyimg.png';
import { useNavigate } from 'react-router-dom';

import Snakes from '../Snakes/Snakes';
import ColdDrinks from '../ColdDrinks/ColdDrinks';
import Wine from '../Wine/Wine';
import Smoking from '../Smoking/Smoking';

interface DairyProps {
  is18Plus: boolean;
}

const Dairy = ({ is18Plus }: DairyProps) => {
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
      {is18Plus && (
        <>
          <Wine />
          <Smoking />
        </>
      )}
    </>
  );
};

export default Dairy;