import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ReelsSection from '../components/ReelsSection';
import { ClothesCategorySection } from '../components/ClothesCategorySection';

import { ProductCarousel } from '../components/ProductCarousel';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      <ProductCarousel title="Lo Nuevo 🔥" apiUrl="/api/productos/?ordering=-fecha_registro" limit={6}/>

      {/* Categorías Zapatillas */}
      <CategorySection />
      {/* Carrusel de Zapatillas Populares */}
      <ProductCarousel title="Zapatillas Populares" apiUrl="/api/productos/?search=Zapatilla" limit={6}/>

      {/* Sección Instagram Reels */}
      <ReelsSection />
      <ProductCarousel title="Ofertas Especiales 🏷️" apiUrl="/api/productos/?en_oferta=true" limit={6}/>


      {/* Categorías Ropa y Accesorios */}
      <ClothesCategorySection />
      <ProductCarousel title="Todos Nuestros Productos" apiUrl="/api/productos/" limit={8}/>
    </div>
  );
}

export default HomePage;
