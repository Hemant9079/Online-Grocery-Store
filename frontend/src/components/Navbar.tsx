import '../style/navbar.css'
import logo from '../imgs/logo.png'
// import { useState } from "react";

// function LocationOption() {
//   const [option, setOption] = useState("");

//   return (
//     <div className="location-box">
//       <h3>Choose Delivery Location</h3>

//       <label className="option">
//         <input
//           type="radio"
//           name="location"
//           value="auto"
//           onChange={() => setOption("auto")}
//         />
//         📍 Use My Current Location
//       </label>

//       <label className="option">
//         <input
//           type="radio"
//           name="location"
//           value="manual"
//           onChange={() => setOption("manual")}
//         />
//         ✍️ Enter Location Manually
//       </label>

//       {option === "manual" && (
//         <input
//           type="text"
//           className="address-input"
//           placeholder="Enter your address"
//         />
//       )}

//       {option === "auto" && (
//         <p className="info-text">
//           Location will be fetched automatically (coming soon 🚀)
//         </p>
//       )}
//     </div>
//   );
// }

const Navbar = () => {
  return (
    <div className='navbar'>
       <img src={logo} alt="Logo" className="logo" />
       {/* <LocationOption /> */}
       <input type="search" name="" id="location" placeholder='select your location' />
       <input type="search" name="" id="products" placeholder='search products' />
       <a href="./login">Login</a>
       <a href="./cart">My Cart</a>

      
    </div>
  )
}

export default Navbar
