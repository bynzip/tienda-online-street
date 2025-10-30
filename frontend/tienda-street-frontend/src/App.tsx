import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProdutsPage from './pages/ProductsPage.tsx';
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProdutsPage />} />
      </Routes>
    </>
  );
}
export default App;
