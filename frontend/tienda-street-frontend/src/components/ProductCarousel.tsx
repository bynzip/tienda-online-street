import React, { useRef } from 'react';
import type { IProductos } from '../interfaces/productos';
import { ProductCard } from './ProductCard';
import { useFetch } from '../api/useFetch';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  title: string;
  apiUrl: string;
  limit?: number;
}

const CardSkeleton = () => (
  <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm">
    <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
    <div className="p-4 min-h-[120px]">
      <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse mb-2"></div>
      <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse mb-4"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse"></div>
    </div>
  </div>
);

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, apiUrl, limit }) => {
  const { data: products, loading, error } = useFetch<IProductos[]>(apiUrl);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const productsToRender = products ? (limit ? products.slice(0, limit) : products) : [];
  const showViewAllButton = limit && products && products.length > limit;

  const getFilterUrl = (url: string) => {
    if (url.startsWith('/api/productos')) {
      return url.replace('/api', '');
    }
    return '/productos';
  };
  const filterUrl = getFilterUrl(apiUrl);

  // Función para scroll suave de 4 productos
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Calcular dinámicamente el ancho de la tarjeta basado en el ancho de la pantalla
      const cardWidth = window.innerWidth < 1024 ? 200 : 290; // lg: 290px, default: 200px
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 4; // Scroll por 4 productos
      const newScrollLeft =
        direction === 'left'
          ? Math.max(0, container.scrollLeft - scrollAmount)
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-1">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          {showViewAllButton && (
            <Link
              to={filterUrl}
              className="shrink-0 text-sm font-semibold text-gray-800 transition-colors hover:text-gray-900"
            >
              Ver Más
            </Link>
          )}
          {/* Botones de navegación */}
          {!loading && !error && productsToRender.length > 4 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md active:bg-gray-100 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md active:bg-gray-100 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de productos con scroll horizontal */}
      <div className="relative mx-4 sm:mx-6 lg:mx-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {loading && (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-none w-[280px] snap-start">
                  <CardSkeleton />
                </div>
              ))}
            </>
          )}

          {error && <p className="text-red-500 py-8">Error al cargar productos: {error}</p>}

          {!loading && !error && (
            <>
              {productsToRender.length === 0 ? (
                <p className="text-gray-500 py-8">No hay productos para mostrar.</p>
              ) : (
                productsToRender.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex-none h-full w-[180px] lg:w-[290px] snap-start"
                  >
                    <ProductCard producto={producto} />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
