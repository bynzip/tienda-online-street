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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenedor principal del producto */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm py-8 lg:px-10">
          {/* Galería de imágenes - Izquierda */}
          <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />

          {/* Detalles del producto - Derecha */}
          <ProductDetails producto={producto} />
        </div>
      </div>

      {/* Productos recomendados */}
      <ProductCarousel
        title="Productos Recomendados"
        apiUrl={`/api/productos/`}
        limit={8}
      />
    </div>
  );
}

export default ProductDetailPage;