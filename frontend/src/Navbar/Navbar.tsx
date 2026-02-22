import './navbar.css';
import logo from './logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, type ChangeEvent } from 'react';
import { allProducts } from '../data/products';
import ApiLocation from './ApiLocation';

const Navbar = () => {
  const { cartCount, isLoggedIn, logout, currentUser } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof allProducts>([]);
  const navigate = useNavigate();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().startsWith(term.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleLinkClick = (id: number) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${id}`);
  };

  return (
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
                onClick={() => handleLinkClick(product.id)}
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

      {/* Auth section — show username + logout after login */}
      {isLoggedIn && currentUser ? (
        <div className="navbar-user">
          <div className="navbar-user-pill">
            <span className="navbar-user-avatar">
              {currentUser.username.charAt(0).toUpperCase()}
            </span>
            <span className="navbar-user-name">{currentUser.username}</span>
          </div>
          <button className="navbar-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}

      <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
        My Cart {cartCount > 0 && (
          <span style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', marginLeft: '5px' }}>
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default Navbar;
