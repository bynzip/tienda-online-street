import React from 'react';
import { Link } from 'react-router-dom';
import type { IProductos } from '../interfaces/productos';

interface ProductCardProps {
  producto: IProductos;
}

const PlaceholderImage = () => (
  <div className="flex h-full w-full items-center justify-center bg-gray-100">
    <span className="text-gray-400 text-sm">Sin Imagen</span>
  </div>
);

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  return (
    <Link
      to={`/producto/${producto.id}`}
      className="group block h-full w-full overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Contenedor de imagen con aspect ratio fijo */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        {producto.imagen_principal ? (
          <img
            loading="lazy"
            decoding="async"
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      {/* Contenido con altura mínima fija */}
      <div className="p-4 min-h-[120px] flex flex-col">
        {/* Nombre */}
        <h3 className="text-[17px] font-semibold text-gray-900 line-clamp-2 mb-1">
          {producto.nombre}
        </h3>

        {/* Marca */}
        <p className="text-[11px] uppercase text-gray-500 mb-2">{producto.marca}</p>

        {/* Espaciador flexible */}
        <div className="grow"></div>

        {/* Descuento */}
        {producto.en_oferta && producto.descuento_porcentaje > 0 && (
          <span className="adsolute text-[11px] font-semibold text-green-600">
            {producto.descuento_porcentaje}% de descuento
          </span>
        )}

        {/* Precios */}
        <div className="flex items-baseline gap-2 mt-auto">
          {!producto.en_oferta ? (
            <p className="text-[16px] font-semibold text-gray-900">S/ {producto.precio_final}</p>
          ) : (
            <>
              <p className="text-[16px] font-semibold text-gray-900">S/ {producto.precio_final}</p>
              <p className="text-[11px] text-gray-500 line-through">S/ {producto.precio_base}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
