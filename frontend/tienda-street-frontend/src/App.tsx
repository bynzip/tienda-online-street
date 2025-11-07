import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProdutsPage from './pages/ProductsPage.tsx';
import Footer from './pages/Footer.tsx';
import './index.css';
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProdutsPage />} />
      </Routes>
      <Footer />
    </>
  );
}
export default App;
