import './navbar.css'
import logo from './logo.png'
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <div className='navbar'>
      <img src={logo} alt="Logo" className="logo" />
      {/* <LocationOption /> */}
      <input type="search" name="" id="location" placeholder='select your location' />
      <input type="search" name="" id="products" placeholder='search products' />
      <Link to="/login">Login</Link>
      <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
        My Cart {cartCount > 0 && <span style={{ backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', marginLeft: '5px' }}>{cartCount}</span>}
      </Link>
    </div>
  )
}

export default Navbar
