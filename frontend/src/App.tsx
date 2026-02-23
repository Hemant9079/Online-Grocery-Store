import { useState } from 'react';
import Navbar from './Navbar/Navbar';
import Dairy from './DairyProduct/Dairy';
import Dairy_Products from './DairyProduct/Dairy_Products';
import Snakes_Products from './Snakes/Snakes_Products';
import ColdDrinks_Products from './ColdDrinks/ColdDrinks_Products';
import Wine_Products from './Wine/Wine_Products';
import Smoking_Products from './Smoking/Smoking_Products';
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
import { CartProvider, useCart } from './context/CartContext';
import OrderConfirm from './OrderConfirm/OrderConfirm.tsx';
import Admin from './Admin/Admin.tsx';

// Inner component — lives inside CartProvider so useCart() works
const AppInner = () => {
  const [is18Plus, setIs18Plus] = useState(false);
  const location = useLocation();
  const { isAdmin } = useCart();

  const hideNavbar = ['/login', '/signup', '/order-confirm', '/admin'].includes(location.pathname);

  return (
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
        <Route path="/snakes-products" element={<ProtectedRoute><Snakes_Products /></ProtectedRoute>} />
        <Route path="/cold-drinks" element={<ProtectedRoute><ColdDrinks /></ProtectedRoute>} />
        <Route path="/cold-drinks-products" element={<ProtectedRoute><ColdDrinks_Products /></ProtectedRoute>} />
        <Route path="/wine" element={<ProtectedRoute><Wine /></ProtectedRoute>} />
        <Route path="/wine-products" element={<ProtectedRoute><Wine_Products /></ProtectedRoute>} />
        <Route path="/smoking" element={<ProtectedRoute><Smoking /></ProtectedRoute>} />
        <Route path="/smoking-products" element={<ProtectedRoute><Smoking_Products /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/order-confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />

        {/* Admin route — admins only */}
        <Route path="/admin" element={
          <ProtectedRoute>{isAdmin ? <Admin /> : <Navigate to="/" replace />}</ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Bottom />
    </div>
  );
};

// Outer App — provides context, then renders AppInner
const App = () => (
  <CartProvider>
    <AppInner />
  </CartProvider>
);

export default App;

