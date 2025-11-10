import { ProductCarousel } from '../components/ProductCarousel';

function HomePage() {
  return (
    <div className="min-h-screen">
      <ProductCarousel title="Lo Nuevo 🔥" apiUrl="/api/productos/"/>
      <ProductCarousel title="Zapatillas Populares" apiUrl="/api/productos/?search=Zapatilla" />
    </div>
  );
}
export default HomePage;
