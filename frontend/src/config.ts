// Centralized configuration
const isProduction = import.meta.env.PROD;
const API_URL = isProduction && import.meta.env.VITE_API_URL_DEPLOYMENT
  ? import.meta.env.VITE_API_URL_DEPLOYMENT
  : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000');
console.log("Using API URL:", API_URL); // Log for debugging
export default API_URL;
