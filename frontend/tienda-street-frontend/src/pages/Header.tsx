import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidenav from '../components/Sidenav.tsx';

const MenuIcon = () => (
  <div className="flex flex-col justify-between h-5 w-[30px] cursor-pointer">
    <span className="block h-[3px] w-full rounded-full bg-black"></span>
    <span className="block h-[3px] w-full rounded-full bg-black"></span>
    <span className="block h-[3px] w-full rounded-full bg-black"></span>
  </div>
);

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const openNav = () => setIsNavOpen(true);
  const closeNav = () => setIsNavOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar header si está en el tope o scrolleando hacia arriba
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Ocultar header si scrollea hacia abajo y ha pasado 10px
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <header
        className={`
          sticky top-0 z-40 flex w-full items-center justify-between 
          bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm md:px-6
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        {/* Lado Izquierdo: Botón de Menú */}
        <div className="flex-1">
          <button onClick={openNav} className="p-2" aria-label="Abrir menú">
            <MenuIcon />
          </button>
        </div>

        {/* Centro: Logo */}
        <div className="shrink-0">
          <Link to="/" className="w-40" onClick={closeNav}>
            <img src="/sinfodo_street.png" alt="Streetwear Logo" className="w-40" />
          </Link>
        </div>

        {/* Lado Derecho: (Espacio para el buscador) */}
        <div className="flex-1 text-right">{/* Aquí irá el Buscador */}</div>
      </header>

      <Sidenav isOpen={isNavOpen} onClose={closeNav} />
    </>
  );
}
