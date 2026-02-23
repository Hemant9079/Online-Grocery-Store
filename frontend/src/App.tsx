import { useState } from 'react';
import Navbar from './Navbar/Navbar';
import Dairy from './DairyProduct/Dairy';
import Dairy_Products from './DairyProduct/Dairy_Products';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import OrderConfirm from './OrderConfirm/OrderConfirm.tsx';

const App = () => {
  const [is18Plus, setIs18Plus] = useState(false);
  const location = useLocation();

  const hideNavbar = ['/login', '/signup', '/order-confirm'].includes(location.pathname);

  return (
    <CartProvider>
      <div>
        {!hideNavbar && (
          <>
            <Navbar />
            {location.pathname === '/' && (
              <Toggle18Plus is18Plus={is18Plus} onToggle={setIs18Plus} />
            )}
          </>
        )}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — redirect to /login when not authenticated */}
          <Route path="/" element={<ProtectedRoute><Dairy is18Plus={is18Plus} /></ProtectedRoute>} />
          <Route path="/Dairy-products" element={<ProtectedRoute><Dairy_Products /></ProtectedRoute>} />
          <Route path="/snakes" element={<ProtectedRoute><Snakes /></ProtectedRoute>} />
          <Route path="/cold-drinks" element={<ProtectedRoute><ColdDrinks /></ProtectedRoute>} />
          <Route path="/wine" element={<ProtectedRoute><Wine /></ProtectedRoute>} />
          <Route path="/smoking" element={<ProtectedRoute><Smoking /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/order-confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Bottom />
      </div>
    </CartProvider>
  );
};

export default App;
