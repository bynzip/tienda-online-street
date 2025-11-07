export interface ITallaStock {
  id: number;
  talla: string;
  stock: number;
}

export interface IImagenProducto {
  id: number;
  imagen: string;
  principal: boolean;
}

export interface IProductos {
  id: string;
  sku: string;
  nombre: string;
  marca: string;
  precio_final: string;
  en_oferta: boolean;
  imagen_principal: string | null;
}

export interface IProducto {
  id: string; // UUID
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio_base: string;
  en_oferta: boolean;
  descuento_porcentaje: number;
  precio_final: string;

  // Campos de relaciones (resueltos como strings por el serializer)
  categoria: string;
  genero: string;
  temporada: string;
  marca: string;

  stock_total: number;

  talla_stock: ITallaStock[];
  imagenes: IImagenProducto[];
}

export interface ICategoria {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface IMarcas {
  id: string;
  nombre: string;
  pais_origen?: string | null;
}