import React from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../api/useFetch.tsx';
import type { ICategoria, IMarcas } from '../interfaces/productos.ts';
import { InstagramIcon, TwitterIcon } from '../icons/SocialIcons.tsx';

// Componente interno para manejar los enlaces del router
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link to={href} className="text-gray-400 transition-colors hover:text-white text-sm">
    {children}
  </Link>
);

const Footer = () => {
  const { data: categorias } = useFetch<ICategoria[]>('/api/categorias/');
  const { data: marcas } = useFetch<IMarcas[]>('/api/marcas/');

  return (
    <footer className="border-t border-gray-800 bg-black text-gray-300">
      <div className="container mx-auto max-w-7xl px-10 py-12 md:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4 ">
          {/* Columna 1: Categorías */}
          <div className="grid gap-2">
            <h3 className="font-semibold text-white">Categorías</h3>
            {categorias?.map((categoria) => (
              <FooterLink key={categoria.id} href={`/productos?categoria=${categoria.id}`}>
                {categoria.nombre}
              </FooterLink>
            ))}
          </div>

          {/* Columna 2: Marcas Populares */}
          <div className="grid gap-2">
            <h3 className="font-semibold text-white">Marcas</h3>
            {marcas?.map((marca) => (
              <FooterLink key={marca.id} href={`/productos?marca=${marca.id}`}>
                {marca.nombre}
              </FooterLink>
            ))}
          </div>

          {/* Columna 3: Información */}
          <div className="flex flex-col gap-2 ">
            <h3 className="font-semibold text-white">Tienda</h3>
            <FooterLink href=" ">Acerca de nosotros</FooterLink>
          </div>

          {/* Columna 4: Redes Sociales (usando iconos locales) */}
          <div className="flex flex-col justify-end items-end gap-4">
            <div className="flex items-center gap-4 px-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} STREETWEAR PERÚ.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
