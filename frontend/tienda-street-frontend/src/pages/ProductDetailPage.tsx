import { useState, useEffect } from 'react'; // 1. Importamos hooks
import { useParams } from 'react-router-dom';
import { useFetch } from '../api/useFetch';
import type { IProducto } from '../interfaces/productos';
import ProductGallery from '../components/ProductGallery';
import ProductDetails from '../components/ProductDetails';
import { ProductCarousel } from '../components/ProductCarousel';

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: producto, loading, error } = useFetch<IProducto>(`/api/productos/${id}/`);

  // 2. Lógica para detectar scroll (Copiada de tu Header para que se muevan igual)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si estamos arriba del todo (<10px) o haciendo scroll hacia arriba, mostramos header
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // Si bajamos y pasamos el tope, ocultamos header
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsHeaderVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error al cargar producto
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Columna Izquierda: Galería */}
          <div className="w-full">
            <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />
          </div>

          {/* Columna Derecha: Info Dinámica */}
          {/* 3. APLICAMOS CLASES DINÁMICAS:
              - transition-[top]: Para que el cambio de posición sea suave (animado).
              - isHeaderVisible ? 'lg:top-24' : 'lg:top-4': 
                 * Si el header se ve, bajamos a 96px (top-24) para no chocar.
                 * Si el header se va, subimos a 16px (top-4) para aprovechar el espacio.
          */}
          <div
            className={`
            px-5 lg:px-2 h-fit pt-4 lg:pt-2
            lg:sticky transition-[top] duration-300 ease-in-out
            ${isHeaderVisible ? 'lg:top-30' : 'lg:top-8'}
          `}
          >
            <ProductDetails producto={producto} />
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-gray-100 pt-10">
        <ProductCarousel
          title="Te podría interesar"
          apiUrl={`/api/productos/${id}/recommend/`}
          limit={8}
        />
      </div>
    </div>
  );
}

export default ProductDetailPage;
