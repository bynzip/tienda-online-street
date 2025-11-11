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

      {/* Primera Sección de Productos (Carruseles) */}
      <div className="py-8">
         <ProductCarousel title="Lo Nuevo 🔥" apiUrl="/api/productos/"/>
         {/* Puedes añadir más espacio si lo necesitas entre carruseles */}
         <div className="mt-8">
            <ProductCarousel title="Zapatillas Populares" apiUrl="/api/productos/?search=Zapatilla" />
         </div>
      </div>

      {/* Categorías Zapatillas */}
      <CategorySection />

      {/* Segunda Sección de Productos (Ejemplo de más carruseles, ajusta según necesites) */}
      <div className="py-8">
         <ProductCarousel title="Ofertas Especiales 🏷️" apiUrl="/api/productos/?en_oferta=true" />
      </div>

      {/* Categorías Ropa y Accesorios */}
      <ClothesCategorySection />

      {/* Sección Instagram Reels */}
      <ReelsSection />
    </div>
  );
}

export default HomePage;