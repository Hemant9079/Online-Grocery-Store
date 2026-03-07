// Centralized configuration
const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? 'https://online-grocery-store-brqh.onrender.com' 
    : 'http://127.0.0.1:5000');

console.log("Using API URL:", API_URL); // Log for debugging
export default API_URL;
