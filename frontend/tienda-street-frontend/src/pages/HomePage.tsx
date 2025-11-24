import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ReelsSection from '../components/ReelsSection';
import { ClothesCategorySection } from '../components/ClothesCategorySection';
import { useCart } from '../hooks/useCart';

import { ProductCarousel } from '../components/ProductCarousel';

function HomePage() {
  const { items: cartItems } = useCart();

  const lastItemAdded = cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;

  const recommendApiUrl = lastItemAdded
    ? `/api/productos/${lastItemAdded.productId}/recommend/`
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      {recommendApiUrl && (
        <ProductCarousel title="Recomendado para ti 🛍️" apiUrl={recommendApiUrl} />
      )}

      {/* Categorías Zapatillas */}
      <CategorySection />
      {/* Carrusel de Zapatillas Populares */}
      <ProductCarousel
        title="Zapatillas Populares"
        apiUrl="/api/productos/?search=Zapatilla"
        limit={6}
      />

      {/* Sección Instagram Reels */}
      <ReelsSection />
      <ProductCarousel
        title="Ofertas Especiales 🏷️"
        apiUrl="/api/productos/?en_oferta=true"
        limit={6}
      />

      {/* Categorías Ropa y Accesorios */}
      <ClothesCategorySection />
      <ProductCarousel title="Todos Nuestros Productos" apiUrl="/api/productos/" limit={8} />
    </div>
  );
}

export default HomePage;
