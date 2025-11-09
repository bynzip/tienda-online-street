import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx'; // 1. Importamos clsx
import { useFetch } from '../api/useFetch'; // 2. Importamos el hook de fetch
import type { ICategoria, IMarcas, ITemporada, IGenero } from '../interfaces/productos';

interface SidenavProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={clsx('h-5 w-5 transition-transform duration-300', className)}
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const SidenavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ href, children, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className="block py-2 px-7 text-sm text-gray-700 hover:bg-gray-100"
  >
    {children}
  </Link>
);

const Sidenav: React.FC<SidenavProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const { data: categorias } = useFetch<ICategoria[]>('/api/categorias/');
  const { data: generos } = useFetch<IGenero[]>('/api/generos/');
  const { data: marcas } = useFetch<IMarcas[]>('/api/marcas/');
  const { data: temporadas } = useFetch<ITemporada[]>('/api/temporadas/');

  const linkGroups = [
    { title: 'Géneros', key: 'generos', data: generos, param: 'genero' },
    { title: 'Categorías', key: 'categorias', data: categorias, param: 'categoria' },
    { title: 'Marcas', key: 'marcas', data: marcas, param: 'marca' },
    { title: 'Temporadas', key: 'temporadas', data: temporadas, param: 'temporada' },
  ];

  return (
    <>
      {/* --- Overlay (Fondo Oscuro) --- */}
      <div
        onClick={onClose}
        className={clsx('fixed inset-0 z-1500 bg-black/50 transition-opacity duration-300', {
          'opacity-100': isOpen,
          'opacity-0 pointer-events-none': !isOpen,
        })}
      />

      {/* --- Menú (Sidenav) --- */}
      <nav
        className={clsx(
          'h-full w-[250px] fixed z-2000 top-0 left-0 bg-white pt-[60px] shadow-lg',
          'text-black transform transition-transform duration-400 ease-in-out overflow-y-auto',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-[5px] right-4 text-2xl cursor-pointer p-2"
          aria-label="Cerrar menú"
        >
          &times;
        </button>

        {/* --- Contenido y Links Dinámicos --- */}
        <div className="sidenav-content flex flex-col">
          {/* Bucle para crear las secciones desplegables */}
          {linkGroups.map((group) => (
            <div key={group.key} className="border-b border-gray-200">
              {/* Botón para desplegar */}
              <button
                onClick={() => toggleSection(group.key)}
                className="flex w-full items-center justify-between py-3 px-6 text-lg text-gray-900 hover:bg-gray-100"
              >
                {group.title}
                <ChevronIcon
                  className={clsx({
                    'rotate-180': openSection === group.key,
                  })}
                />
              </button>
              <div
                className={clsx(
                  'overflow-hidden bg-gray-50 transition-all duration-300 ease-in-out',
                  {
                    'max-h-[300px]': openSection === group.key, // 9. Animación de altura
                    'max-h-0': openSection !== group.key,
                  }
                )}
              >
                {group.data?.map((item) => (
                  <SidenavLink
                    key={item.id}
                    href={`/productos?${group.param}=${item.nombre}`}
                    onClick={onClose}
                  >
                    {item.nombre}
                  </SidenavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidenav;
