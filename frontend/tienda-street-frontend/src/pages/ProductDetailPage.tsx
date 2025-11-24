import { useParams } from 'react-router-dom';
import { useFetch } from '../api/useFetch';
import type { IProducto } from '../interfaces/productos';
import ProductGallery from '../components/ProductGallery';
import ProductDetails from '../components/ProductDetails';
import { ProductCarousel } from '../components/ProductCarousel';

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: producto, loading, error } = useFetch<IProducto>(`/api/productos/${id}/`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900">
        Error al cargar producto
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.9fr_1fr] gap-8 lg:gap-12 items-start max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
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
            className={`px-5 lg:px-2 h-fit pt-4 lg:pt-2 transition-[top] duration-300 ease-in-out`}
          >
            <ProductDetails producto={producto} />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <ProductCarousel title="Te podría interesar" apiUrl={`/api/productos/${id}/recommend/`} />
      </div>
    </div>
  );
}

export default ProductDetailPage;
