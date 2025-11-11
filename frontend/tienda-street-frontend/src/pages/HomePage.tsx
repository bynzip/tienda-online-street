import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ReelsSection from '../components/ReelsSection';
import { ClothesCategorySection } from '../components/ClothesCategorySection';

import { ProductCarousel } from '../components/ProductCarousel'; // Asegúrate de que la ruta sea correcta

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      <ProductCarousel title="Lo Nuevo 🔥" apiUrl="/api/productos/" limit={6}/>

      {/* Categorías Zapatillas */}
      <CategorySection />
      {/* Carrusel de Zapatillas Populares */}
      <ProductCarousel title="Zapatillas Populares" apiUrl="/api/productos/?search=Zapatilla" />

      {/* Sección Instagram Reels */}
      <ReelsSection />
      <ProductCarousel title="Ofertas Especiales 🏷️" apiUrl="/api/productos/?en_oferta=true" />


      {/* Categorías Ropa y Accesorios */}
      <ClothesCategorySection />
      <ProductCarousel title="Todos Nuestros Productos" apiUrl="/api/productos/"/>
    </div>
  );
}

export default HomePage;