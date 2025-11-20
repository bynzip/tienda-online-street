import type { IImagenProducto } from '../interfaces/productos';

interface ProductGalleryProps {
  imagenes: IImagenProducto[];
  nombre: string;
}

function ProductGallery({ imagenes, nombre }: ProductGalleryProps) {
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="w-full aspect-3/4 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm uppercase tracking-widest">Sin Imagen</span>
      </div>
    );
  }

  return (
    // Eliminamos h-[85vh] y overflow. Dejamos que crezca naturalmente.
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full lg:py-4">
      {imagenes.map((imagen, index) => (
        <div key={imagen.id} className="w-full relative">
          <img
            src={imagen.imagen}
            alt={`${nombre} - Vista ${index + 1}`}
            className="w-full h-auto object-cover block"
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

export default ProductGallery;
