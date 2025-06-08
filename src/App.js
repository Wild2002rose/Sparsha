import './App.css';
import Home from './Components/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemsOfSeller from './Components/ItemsOfSeller';
import Wishlist from './Components/Wishlist';
import Cart from './Components/Cart';
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/itemsofseller' element={<ItemsOfSeller/>}/>
        <Route path='/wishlist' element={<Wishlist/>}/>
        <Route path='/cart' element={<Cart/>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
