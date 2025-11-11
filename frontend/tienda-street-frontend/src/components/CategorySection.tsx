import { Link } from 'react-router-dom';

// 1. Definimos la interfaz para las props de CategoryCard
interface CategoryCardProps {
  title: string;
  img: string;
  link: string;
}

// 2. Tipamos las props del componente
const CategoryCard = ({ title, img, link }: CategoryCardProps) => (
  <Link
    to={link}
    className="group relative flex-1 max-w-7xl md:h-[500px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden no-underline"
  >
    {/* Imagen de Fondo con Zoom en Hover */}
    <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />

    {/* Gradiente Overlay */}
    <div className="absolute inset-0 bg-linears-to-t from-black/80 via-black/20 to-transparent z-1 transition-all duration-300 group-hover:from-black/90"></div>

    {/* Contenido */}
    <div className="relative z-2 w-full">
      <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight mb-2 font-black text-white drop-shadow-md uppercase">
        {title}
      </h2>
      <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">
        →
      </span>
    </div>
  </Link>
);

export default function CategorySection() {
  return (
    <section className="flex flex-col max-w-7xl mx-auto md:flex-row gap-4 p-4 md:gap-6 md:p-8 lg:px-10">
        <CategoryCard title="Zapatillas Hombre" img="/imagenes/zapatilla-hombre.png" link="/categoria/hombre" />
        <CategoryCard title="Zapatillas Mujer" img="/imagenes/zapatillas-mujer.png" link="/categoria/mujer" />
    </section>
  );
}