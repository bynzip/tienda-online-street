import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFetch } from '../api/useFetch';
import type { IProductos, ICategoria, IMarcas, IGenero } from '../interfaces/productos';
import { ProductCard } from '../components/ProductCard';

const GridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-full overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="aspect-square w-full bg-gray-200 animate-pulse"></div>
        <div className="p-4 min-h-[120px]">
          <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse mb-4"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const apiUrl = useMemo(() => {
    const params = searchParams.toString();
    return params ? `/api/productos/?${params}` : '/api/productos/';
  }, [searchParams]);

  const { data: products, loading, error } = useFetch<IProductos[]>(apiUrl);

  const activeFilters = useMemo(() => {
    const entries: { key: string; value: string }[] = [];
    searchParams.forEach((value, key) => {
      entries.push({ key, value });
    });
    return entries;
  }, [searchParams]);

  // 2. Hacemos fetch de los nombres de los filtros
  const { data: categorias } = useFetch<ICategoria[]>('/api/categorias/');
  const { data: marcas } = useFetch<IMarcas[]>('/api/marcas/');
  const { data: generos } = useFetch<IGenero[]>('/api/generos/');

  const pageTitle = useMemo(() => {
    if (loading) return 'Cargando Productos...';

    // Sin filtros
    if (activeFilters.length === 0) return 'Todos los Productos';

    // Tomamos el primer filtro (para mantenerlo simple)
    const firstFilter = activeFilters[0];
    const { key, value } = firstFilter;

    // Si es una búsqueda
    if (key === 'search') {
      return `Resultados para "${value}"`;
    }

    // Si es una categoría
    if (key === 'categoria' && categorias) {
      // Buscamos el nombre de la categoría que coincida con el ID (value)
      const nombre = categorias.find((c) => c.id.toString() === value)?.nombre;
      return nombre || 'Categoría'; // Usamos el nombre o un fallback
    }

    // Si es una marca
    if (key === 'marca' && marcas) {
      const nombre = marcas.find((m) => m.id.toString() === value)?.nombre;
      return nombre || 'Marca';
    }

    // Si es un género
    if (key === 'genero' && generos) {
      const nombre = generos.find((g) => g.id.toString() === value)?.nombre;
      return nombre || 'Género';
    }

    // Título por defecto si el filtro no se reconoce o los datos aún no cargan
    return 'Productos Filtrados';
  }, [loading, activeFilters, categorias, marcas, generos]); // Depende de estos valores

  const clearFilters = () => navigate('/productos');

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen bg-white">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && <GridSkeleton />}

      {error && (
        <div className="py-12 text-center">
          <p className="text-red-500">Error al cargar productos: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {!products || products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                No se encontraron productos con los filtros aplicados.
              </p>
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline underline-offset-4"
              >
                Quitar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">{products.length} resultado(s)</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          to="/"
          className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
