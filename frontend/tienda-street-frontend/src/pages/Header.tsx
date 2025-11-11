import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidenav from '../components/Sidenav.tsx';
import type { IProductos } from '../interfaces/productos';

// Icono de Menú Hamburguesa
const MenuIcon = () => (
  <div className="flex flex-col justify-between h-5 w-[30px] cursor-pointer group">
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
  </div>
);

// Icono de Lupa (SVG)
const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-4 w-4" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // Estado opcional para el valor de búsqueda
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<IProductos[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const suggestCache = useRef<Map<string, IProductos[]>>(new Map());

  const navigate = useNavigate();
  const location = useLocation();

  const openNav = () => setIsNavOpen(true);
  const closeNav = () => setIsNavOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q.length === 0) {
      navigate('/productos');
      return;
    }
    navigate(`/productos?search=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search') || '';
    setSearchValue(s);
  }, [location.search]);

  // Autocompletado: fetch de sugerencias con debounce
  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const q = searchValue.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoadingSuggest(false);
      return;
    }

    // Cache local de sugerencias
    const cached = suggestCache.current.get(q);
    if (cached) {
      setSuggestions(cached.slice(0, 6));
      setShowSuggest(true);
      setLoadingSuggest(false);
      return;
    }

    setLoadingSuggest(true);
    timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/productos/?search=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Error al buscar');
        const data: IProductos[] = await res.json();
        if (!active) return;
        suggestCache.current.set(q, data);
        setSuggestions(data.slice(0, 6));
        setShowSuggest(true);
      } catch (_) {
        if (!active) return;
        setSuggestions([]);
      } finally {
        if (!active) return;
        setLoadingSuggest(false);
      }
    }, 150);

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [searchValue]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <>
      <header
        className={`
          sticky top-0 z-40 flex w-full items-center justify-between 
          bg-white/98 px-4 py-3 shadow-sm backdrop-blur-sm md:px-8
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        {/* Lado Izquierdo: Botón de Menú */}
        <div className="flex-1 flex justify-start">
          <button onClick={openNav} className="p-2 -ml-2" aria-label="Abrir menú">
            <MenuIcon />
          </button>
        </div>

        {/* Centro: Logo */}
        <div className="shrink-0">
          <Link to="/" className="block" onClick={closeNav}>
            <img src="/sinfodo_street.png" alt="Streetwear Logo" className="w-32 md:w-40" />
          </Link>
        </div>

        {/* Lado Derecho: Buscador */}
        <div className="flex-1 flex justify-end relative" ref={searchRef}>
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 transition-colors hover:border-gray-400"
          >
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onFocus={() => setShowSuggest(true)}
              onChange={(e) => setSearchValue(e.target.value)}
              className="
                w-20 bg-transparent p-1 text-sm text-gray-700 placeholder-gray-400 outline-none
                transition-all duration-300 ease-in-out
                focus:w-32 md:w-28 md:focus:w-44
              "
            />
            <button
              type="submit"
              className="ml-1 p-1 text-gray-400 transition-colors hover:text-black"
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>
          </form>

          {showSuggest && suggestions.length > 0 && (
            <div className="absolute right-4 top-[52px] md:right-8 md:top-[56px] w-[90vw] max-w-md bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-auto">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/producto/${p.id}`}
                      onClick={() => setShowSuggest(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50"
                    >
                      <div className="h-12 w-12 flex-none overflow-hidden rounded bg-gray-100">
                        {p.imagen_principal ? (
                          <img loading="lazy" decoding="async" src={p.imagen_principal.replace(/^https?:\/(\/)?(localhost|127\.0\.0\.1):8000/i,'')} alt={p.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">S/ {p.precio_final}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="p-2 border-t border-gray-100">
                <Link
                  to={`/productos?search=${encodeURIComponent(searchValue.trim())}`}
                  onClick={() => setShowSuggest(false)}
                  className="block text-center text-sm font-semibold text-gray-800 hover:text-gray-900"
                >
                  Ver todo "{searchValue.trim()}"
                </Link>
              </div>
            </div>
          )}

          {showSuggest && loadingSuggest && (
            <div className="absolute right-4 top-[52px] md:right-8 md:top-[56px] w-[90vw] max-w-md bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-500">
              Buscando...
            </div>
          )}
        </div>
      </header>

      <Sidenav isOpen={isNavOpen} onClose={closeNav} />
    </>
  );
}
