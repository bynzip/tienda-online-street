import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import Footer from './pages/Footer.tsx';
import Header from './pages/Header.tsx';
import './index.css';
import ScrollToTop from './components/ScrollToTop.tsx';
import ProductsPage from './pages/ProductsPage.tsx';

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/productos" element={<ProductsPage />} />
      </Routes>
      <Footer />
    </>
  );
}
export default App;
