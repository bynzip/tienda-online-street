import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidenav from '../components/Sidenav.tsx';
import { Search } from '../components/Search.tsx';

const MenuIcon = () => (
  <div className="flex flex-col justify-between h-5 w-[30px] cursor-pointer group">
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
    <span className="block h-[3px] w-full rounded-full bg-black transition-all group-hover:bg-gray-700"></span>
  </div>
);

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

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const openNav = () => setIsNavOpen(true);
  const closeNav = () => setIsNavOpen(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  //Esconder Header al hacer Scroll
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
          <button onClick={openNav} className="p-2 -ml-2 cursor-pointer" aria-label="Abrir menú">
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
        <div className="flex-1 flex justify-end">
          <button
            onClick={openSearch}
            className="p-2 text-gray-700 hover:text-black transition-colors cursor-pointer"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </div>
      </header>

      <Sidenav isOpen={isNavOpen} onClose={closeNav} />
      <Search isOpen={isSearchOpen} closeSearch={closeSearch} />
    </>
  );
}
