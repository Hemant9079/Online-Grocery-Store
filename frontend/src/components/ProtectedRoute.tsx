import { useCart } from '../context/CartContext';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn } = useCart();
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
