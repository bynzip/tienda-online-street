import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import Footer from './pages/Footer.tsx';
import Header from './pages/Header.tsx';
import './index.css';
import ScrollToTop from './components/ScrollToTop.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import CartPage from './pages/CartPage.tsx';
import { CartProvider } from './contexts/CartContext.tsx';

function App() {
  return (
    <CartProvider>
      <>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/carrito" element={<CartPage />} />
        </Routes>
        <Footer />
      </>
    </CartProvider>
  );
}
export default App;
