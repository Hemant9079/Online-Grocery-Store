import './navbar.css';
import logo from './logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, type ChangeEvent } from 'react';
import { allProducts } from '../data/products';
import ApiLocation from './ApiLocation';
import { useDynamicProducts } from '../hooks/useDynamicProducts';
import AdminPanel from '../Admin/AdminPanel';

interface SearchResult {
  id: string | number;
  name: string;
  price: number;
  imgUrl: string;
}

const Navbar = () => {
  const { cartCount, isLoggedIn, logout, currentUser, isAdmin } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const navigate = useNavigate();

  // Pull all DB products for search (refreshes when cache busted)
  const { products: dynamicProducts } = useDynamicProducts();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      const lo = term.toLowerCase();

      const fromStatic: SearchResult[] = allProducts
        .filter(p => p.name.toLowerCase().startsWith(lo))
        .map(p => ({ id: p.id, name: p.name, price: p.price, imgUrl: p.imgUrl }));

      const fromDynamic: SearchResult[] = dynamicProducts
        .filter(p => p.name.toLowerCase().startsWith(lo))
        .map(p => ({ id: p._id, name: p.name, price: p.price, imgUrl: p.imgUrl }));

      const seen = new Set<string>();
      const merged: SearchResult[] = [];
      for (const p of [...fromStatic, ...fromDynamic]) {
        if (!seen.has(p.name.toLowerCase())) {
          seen.add(p.name.toLowerCase());
          merged.push(p);
        }
      }
      setSearchResults(merged);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (id: string | number) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${id}`);
  };

  return (
    <>
      <div className='navbar' style={{ position: 'relative' }}>
        <img src={logo} alt="Logo" className="logo" />

        {/* Location picker */}
        <ApiLocation />

        {/* Product search */}
        <div className="search-container" style={{ position: 'relative' }}>
          <input
            type="search"
            id="products"
            placeholder='search products'
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <div className="search-dropdown" style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'white', border: '1px solid #ccc',
              zIndex: 1000, maxHeight: '300px', overflowY: 'auto'
            }}>
              {searchResults.map(product => (
                <div
                  key={product.id}
                  className="search-result-item"
                  style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  onClick={() => handleResultClick(product.id)}
                >
                  <img src={product.imgUrl} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{product.name}</p>
                    <p style={{ margin: 0, color: '#555', fontSize: '12px' }}>Rs {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Admin Add Product button ── */}
        {isAdmin && (
          <button
            className="admin-nav-btn"
            onClick={() => setAdminPanelOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', border: 'none', borderRadius: 20,
              fontSize: '0.82rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(22,163,74,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            🛡️ Add Product
          </button>
        )}

        {/* Auth section */}
        {isLoggedIn && currentUser ? (
          <div className="navbar-user">
            <div className="navbar-user-pill">
              <span className="navbar-user-avatar">
                {currentUser.username.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-user-name">
                {currentUser.username} {isAdmin && '👑'}
              </span>
            </div>
            <button className="navbar-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}

        <Link to="/order-history" style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
          📦 My Orders
        </Link>

        <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
          My Cart {cartCount > 0 && (
            <span style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', marginLeft: '5px' }}>
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Admin slide-in panel */}
      {adminPanelOpen && (
        <AdminPanel
          onClose={() => setAdminPanelOpen(false)}
          onProductAdded={() => {/* category pages auto-refresh via hook */ }}
        />
      )}
    </>
  );
};

export default Navbar;
