import Navbar from './Navbar/Navbar'
import Dairy from './DairyProduct/Dairy'
import Dairy_Products from './DairyProduct/Dairy_Products'
import { Routes, Route } from 'react-router-dom'
import Snakes from './Snakes/Snakes'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dairy />} />
        <Route path="/Dairy-products" element={<Dairy_Products />} />
        <Route path="/snakes" element={<Snakes />} />
      </Routes>
    </div>
  )
}

export default App
