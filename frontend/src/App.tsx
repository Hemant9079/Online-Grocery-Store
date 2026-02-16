import { useState } from 'react';
import Navbar from './Navbar/Navbar';
import Dairy from './DairyProduct/Dairy';
import Dairy_Products from './DairyProduct/Dairy_Products';
import { Routes, Route } from 'react-router-dom';
import Snakes from './Snakes/Snakes';
import Wine from './Wine/Wine';
import ColdDrinks from './ColdDrinks/ColdDrinks';
import Smoking from './Smoking/Smoking';
import Toggle18Plus from './components/Toggle18Plus';
import Bottom from './Bottom/Bottom';

const App = () => {
  const [is18Plus, setIs18Plus] = useState(false);

  return (
    <div>
      <Navbar />
      <Toggle18Plus is18Plus={is18Plus} onToggle={setIs18Plus} />
      <Routes>
        <Route path="/" element={<Dairy is18Plus={is18Plus} />} />
        <Route path="/Dairy-products" element={<Dairy_Products />} />
        <Route path="/snakes" element={<Snakes />} />
        <Route path="/cold-drinks" element={<ColdDrinks />} />
        <Route path="/wine" element={<Wine />} />
        <Route path="/smoking" element={<Smoking />} />
      </Routes>
      <Bottom />
    </div>
  );
};

export default App
