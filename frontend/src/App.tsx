import { useState } from 'react';
import Navbar from './Navbar/Navbar';
import Dairy from './DairyProduct/Dairy';
import Dairy_Products from './DairyProduct/Dairy_Products';
import { Routes, Route, useLocation } from 'react-router-dom';
import Snakes from './Snakes/Snakes';
import Wine from './Wine/Wine';
import ColdDrinks from './ColdDrinks/ColdDrinks';
import Smoking from './Smoking/Smoking';
import Toggle18Plus from './components/Toggle18Plus';
import Bottom from './Bottom/Bottom';
import Login from './Login/Login.tsx';
import Signup from './Signup/Signup.tsx';
import Cart from './Cart/Cart.tsx';
import ProductDetail from './ProductDetail/ProductDetail.tsx';

import { CartProvider } from './context/CartContext';

const App = () => {
  const [is18Plus, setIs18Plus] = useState(false);
  const location = useLocation();

  const hideNavbarComponent = ['/login', '/signup'].includes(location.pathname);

  return (
    <CartProvider>
      <div>
        {!hideNavbarComponent && (
          <>
            <Navbar />
            {location.pathname === '/' && (
              <Toggle18Plus is18Plus={is18Plus} onToggle={setIs18Plus} />
            )}
          </>
        )}
        <Routes>
          <Route path="/" element={<Dairy is18Plus={is18Plus} />} />
          <Route path="/Dairy-products" element={<Dairy_Products />} />
          <Route path="/snakes" element={<Snakes />} />
          <Route path="/cold-drinks" element={<ColdDrinks />} />
          <Route path="/wine" element={<Wine />} />
          <Route path="/smoking" element={<Smoking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
        <Bottom />
      </div>
    </CartProvider>
  );
};

export default App
