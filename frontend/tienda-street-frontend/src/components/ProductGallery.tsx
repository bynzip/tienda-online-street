import { useState } from 'react';
import type { IImagenProducto } from '../interfaces/productos';

interface ProductGalleryProps {
  imagenes: IImagenProducto[];
  nombre: string;
}

const PlaceholderImage = () => (
  <div className="flex h-full w-full items-center justify-center bg-gray-100">
    <span className="text-gray-400 text-lg">Sin Imagen</span>
  </div>
);

function ProductGallery({ imagenes, nombre }: ProductGalleryProps) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <PlaceholderImage />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-5 lg:py-2 lg:px-1">
      {/* Imagen principal */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
        <img
          src={imagenes[imagenSeleccionada].imagen}
          alt={`${nombre} - Imagen ${imagenSeleccionada + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {imagenes.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {imagenes.map((imagen, index) => (
            <button
              key={imagen.id}
              onClick={() => setImagenSeleccionada(index)}
              className={`
                aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${
                  imagenSeleccionada === index
                    ? 'border-black shadow-md'
                    : 'border-gray-200 hover:border-gray-400'
                }
              `}
            >
              <img
                src={imagen.imagen}
                alt={`${nombre} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;