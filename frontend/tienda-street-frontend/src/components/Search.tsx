import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { IProductos } from '../interfaces/productos';
import clsx from 'clsx';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlaceholderImage = () => (
  <div className="flex h-full w-full items-center justify-center bg-gray-100">
    <span className="text-gray-400 text-xs">Sin Imagen</span>
  </div>
);

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<IProductos[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestCache = useRef<Map<string, IProductos[]>>(new Map());

  const navigate = useNavigate();
  const location = useLocation();

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setSearchValue('');
    setSuggestions([]);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchValue.trim();
    if (q.length === 0) {
      navigate('/productos');
    } else {
      navigate(`/productos?search=${encodeURIComponent(q)}`);
    }
    closeSearch();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search') || '';
    if (s) setSearchValue(s);
  }, [location.search]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const q = searchValue.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const cached = suggestCache.current.get(q);
    if (cached) {
      setSuggestions(cached.slice(0, 8));
      setLoading(false);
      return;
    }

    setLoading(true);
    timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/productos/?search=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Error al buscar');
        const data: IProductos[] = await res.json();
        if (!active) return;
        suggestCache.current.set(q, data);
        setSuggestions(data.slice(0, 8));
      } catch {
        if (!active) return;
        setSuggestions([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [searchValue]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón para abrir búsqueda */}
      <button
        onClick={openSearch}
        className="p-2 text-gray-700 hover:text-black transition-colors"
        aria-label="Buscar"
      >
        <SearchIcon />
      </button>

      {/* Overlay de búsqueda */}
      {isOpen && (
        <div
          onClick={closeSearch}
          className={clsx(
            'h-full w-full fixed inset-0 z-15500 bg-black/50 transition-opacity duration-300',
            {
              'opacity-100': isOpen,
              'opacity-0 pointer-events-none': !isOpen,
            }
          )}
        >
          <div className="fixed inset-0 z-50 bg-white ">
            {/* Header del overlay */}
            <div>
              <div className="max-w-4xl mx-auto pt-7 flex items-center gap-4">
                <form
                  onSubmit={handleSearch}
                  className="flex-1 flex items-center gap-3 border-2 border-gray-800 px-3"
                >
                  <SearchIcon />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="¿Qué estás buscando?"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1 bg-transparent text-[16px] outline-none placeholder-gray-600 py-3"
                    autoComplete="off"
                  />
                  <button
                    onClick={closeSearch}
                    className="py-2 rounded-full transition-colors cursor-pointer"
                    aria-label="Cerrar búsqueda"
                  >
                    <CloseIcon />
                  </button>
                </form>
              </div>
            </div>

            {/* Contenido de resultados */}
            {searchValue.trim().length > 2 && (
              <div
                className="max-w-4xl mx-auto px-8 overflow-y-auto pt-5 bg-white shadow-lg z-99999"
                style={{ maxHeight: 'calc(95vh - 80px)' }}
              >
                {loading && (
                  <div className="text-center py-8s">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-3 text-gray-600">Buscando...</p>
                  </div>
                )}

                {!loading && searchValue.trim().length >= 2 && suggestions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      No se encontraron resultados para "{searchValue}"
                    </p>
                    <button
                      onClick={() => {
                        setSearchValue('');
                        inputRef.current?.focus();
                      }}
                      className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                )}

                {!loading && suggestions.length > 0 && (
                  <>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Resultados ({suggestions.length})
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
                      {suggestions.map((producto) => (
                        <Link
                          key={producto.id}
                          to={`/producto/${producto.id}`}
                          onClick={closeSearch}
                          className="group block mb-3"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-50 mb-4">
                            {producto.imagen_principal ? (
                              <img
                                src={producto.imagen_principal}
                                alt={producto.nombre}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <PlaceholderImage />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:underline">
                            {producto.nombre}
                          </h3>
                          <p className="text-[13px] text-gray-600">S/ {producto.precio_final}</p>
                        </Link>
                      ))}
                    </div>

                    <div className="text-center border-t border-gray-200">
                      <button
                        onClick={handleSearch}
                        className="cursor-pointer flex items-center justify-between w-full pt-4 pb-5 text-gray-600 text-sm rounded-lg hover:text-gray-800 hover:underline transition-colors"
                      >
                        Buscar "{searchValue}"
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            {searchValue.trim().length < 2 && <div></div>}
          </div>
        </div>
      )}
    </>
  );
}
