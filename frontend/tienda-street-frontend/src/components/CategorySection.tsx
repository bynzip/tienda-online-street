import { Link } from 'react-router-dom';
import { useFetch } from '../api/useFetch';
import type { IGenero } from '../interfaces/productos';

interface CategoryCardProps {
  title: string;
  img: string;
  link: string;
}

const CategoryCard = ({ title, img, link }: CategoryCardProps) => (
  <Link
    to={link}
    className="group relative flex-1 max-w-7xl md:h-[500px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden no-underline"
  >
    <img
        loading="lazy"
        decoding="async"
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-linaer-gradiento-t from-black/80 via-black/20 to-transparent z-10 transition-all duration-300 group-hover:from-black/90"></div>
    <div className="relative z-20 w-full">
      <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight mb-2 font-black text-white drop-shadow-md uppercase">
        {title}
      </h2>
      <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
    </div>
  </Link>
);

export default function CategorySection() {
  const { data: generos } = useFetch<IGenero[]>('/api/generos/');
  const idHombre = generos?.find((g) => g.nombre.toLowerCase() === 'hombre')?.id;
  const idMujer = generos?.find((g) => g.nombre.toLowerCase() === 'mujer')?.id;

  const linkHombre = idHombre ? `/productos?genero=${idHombre}` : `/productos?search=Hombre`;
  const linkMujer = idMujer ? `/productos?genero=${idMujer}` : `/productos?search=Mujer`;

  return (
    <section className="flex flex-col max-w-7xl mx-auto md:flex-row gap-4 p-4 md:gap-6 md:p-8 lg:px-10">
        <CategoryCard title="Zapatillas Hombre" img="/imagenes/zapatilla-hombre.png" link={linkHombre} />
        <CategoryCard title="Zapatillas Mujer" img="/imagenes/zapatillas-mujer.png" link={linkMujer} />
    </section>
  );
}
