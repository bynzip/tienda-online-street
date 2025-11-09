import { ProductCarousel } from '../components/ProductCarousel';

function HomePage() {
  return (
    <div className="min-h-screen">
      <ProductCarousel title="Lo Nuevo 🔥" apiUrl="/api/productos/?search=SKU" limit={7} />
      <ProductCarousel title="Productos Nike" apiUrl="/api/productos/?search=Nike" />
    </div>
  );
}
export default HomePage;
