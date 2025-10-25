# backend/app_street/management/commands/seed_products.py
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from decimal import Decimal
# Importa todos los modelos necesarios
from app_street.models import (
    Producto, Categoria, Genero, Temporada, Marca, Talla, ProductoTallaStock
)

# --- Define aquí los datos de los productos de ejemplo ---
# Puedes usar la misma estructura que generamos para el CSV
PRODUCTOS_EJEMPLO = [
    {
        'sku': 'SKU001', 'nombre': 'Polo Básico Negro', 'descripcion': 'Polo de algodón cuello redondo.',
        'precio_base': Decimal('19.99'), 'en_oferta': False, 'descuento_porcentaje': 0,
        'categoria': 'Polos', 'genero': 'Hombre', 'temporada': 'Todo el Año', 'marca': 'StreetForce',
        'tallas': ['S', 'M', 'L', 'XL'], 'stocks': [10, 15, 12, 8]
    },
    {
        'sku': 'SKU002', 'nombre': 'Polo Básico Blanco', 'descripcion': 'Polo de algodón cuello redondo.',
        'precio_base': Decimal('19.99'), 'en_oferta': False, 'descuento_porcentaje': 0,
        'categoria': 'Polos', 'genero': 'Mujer', 'temporada': 'Todo el Año', 'marca': 'StreetForce',
        'tallas': ['XS', 'S', 'M'], 'stocks': [5, 10, 10]
    },
    {
        'sku': 'SKU003', 'nombre': 'Jean Slim Fit Azul', 'descripcion': 'Pantalón jean azul oscuro corte slim.',
        'precio_base': Decimal('79.90'), 'en_oferta': True, 'descuento_porcentaje': 15,
        'categoria': 'Pantalones', 'genero': 'Hombre', 'temporada': 'Invierno 2025', 'marca': 'UrbanStyle',
        'tallas': ['30', '32', '34'], 'stocks': [8, 10, 7]
    },
    {
        'sku': 'SKU004', 'nombre': 'Zapatilla Running Max', 'descripcion': 'Zapatilla deportiva para correr.',
        'precio_base': Decimal('120.50'), 'en_oferta': True, 'descuento_porcentaje': 20,
        'categoria': 'Zapatillas', 'genero': 'Unisex', 'temporada': 'Verano 2025', 'marca': 'Nike',
        'tallas': ['40', '41', '42', '43'], 'stocks': [5, 8, 10, 6]
    },
    {
        'sku': 'SKU005', 'nombre': 'Gorra Trucker Logo', 'descripcion': 'Gorra con malla y logo bordado.',
        'precio_base': Decimal('25.00'), 'en_oferta': False, 'descuento_porcentaje': 0,
        'categoria': 'Accesorios', 'genero': 'Unisex', 'temporada': 'Todo el Año', 'marca': 'StreetForce',
        'tallas': ['M'], 'stocks': [25] # Talla única M
    },
    {
        'sku': 'SKU006', 'nombre': 'Polera Hoodie Gris', 'descripcion': 'Polera con capucha y bolsillo canguro.',
        'precio_base': Decimal('89.99'), 'en_oferta': False, 'descuento_porcentaje': 0,
        'categoria': 'Poleras', 'genero': 'Hombre', 'temporada': 'Invierno 2025', 'marca': 'UrbanStyle',
        'tallas': ['M', 'L', 'XL'], 'stocks': [10, 12, 5]
    },
    {
        'sku': 'SKU007', 'nombre': 'Zapatilla Urbana Classic', 'descripcion': 'Zapatilla casual estilo clásico.',
        'precio_base': Decimal('95.00'), 'en_oferta': True, 'descuento_porcentaje': 10,
        'categoria': 'Zapatillas', 'genero': 'Mujer', 'temporada': 'Todo el Año', 'marca': 'Adidas',
        'tallas': ['38', '39', '40'], 'stocks': [6, 9, 7]
    },
    {
        'sku': 'SKU008', 'nombre': 'Pantalón Cargo Verde', 'descripcion': 'Pantalón estilo cargo con bolsillos laterales.',
        'precio_base': Decimal('65.50'), 'en_oferta': False, 'descuento_porcentaje': 0,
        'categoria': 'Pantalones', 'genero': 'Hombre', 'temporada': 'Verano 2025', 'marca': 'StreetForce',
        'tallas': ['32', '34', '36'], 'stocks': [12, 15, 10]
    },
    # Agrega los demás productos aquí si lo deseas...
    {
        'sku': 'SKU016', 'nombre': 'Polo Oversize Blanco', 'descripcion': 'Polo corte holgado color blanco.',
        'precio_base': Decimal('24.99'), 'en_oferta': True, 'descuento_porcentaje': 10,
        'categoria': 'Polos', 'genero': 'Mujer', 'temporada': 'Todo el Año', 'marca': 'StreetForce',
        'tallas': ['S', 'M'], 'stocks': [15, 18]
    },
    {
        'sku': 'SKU020', 'nombre': 'Lentes de Sol Aviador', 'descripcion': 'Lentes estilo aviador marco metálico.',
        'precio_base': Decimal('39.99'), 'en_oferta': True, 'descuento_porcentaje': 25,
        'categoria': 'Accesorios', 'genero': 'Unisex', 'temporada': 'Verano 2025', 'marca': 'Supreme',
        'tallas': ['M'], 'stocks': [15] # Talla única M
    },
]


class Command(BaseCommand):
    help = 'Crea productos de ejemplo en la base de datos.'

    @transaction.atomic # Asegura que si algo falla, no se cree nada a medias
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Iniciando la creación de productos de ejemplo ---'))

        # 1. Verificar que existan las categorías, marcas, tallas, etc. necesarias
        try:
            categorias = {cat.nombre: cat for cat in Categoria.objects.all()}
            generos = {gen.nombre: gen for gen in Genero.objects.all()}
            temporadas = {temp.nombre: temp for temp in Temporada.objects.all()}
            marcas = {m.nombre: m for m in Marca.objects.all()}
            tallas_objs = {t.nombre: t for t in Talla.objects.all()}
        except Exception as e:
            raise CommandError(f"Error al obtener los datos base (categorías, etc.). ¿Ejecutaste 'seed_data' primero? Detalle: {e}")

        productos_creados = 0
        productos_actualizados = 0

        # 2. Iterar sobre los datos de ejemplo y crear/actualizar productos
        for prod_data in PRODUCTOS_EJEMPLO:
            sku = prod_data['sku']
            self.stdout.write(f"Procesando SKU: {sku}...")

            # Validar que las relaciones existan
            categoria_obj = categorias.get(prod_data['categoria'])
            genero_obj = generos.get(prod_data['genero'])
            temporada_obj = temporadas.get(prod_data['temporada'])
            marca_obj = marcas.get(prod_data['marca'])

            if not all([categoria_obj, genero_obj, temporada_obj, marca_obj]):
                self.stdout.write(self.style.WARNING(f"  -> Omitido: Falta categoría, género, temporada o marca para SKU {sku}."))
                continue

            # Validar que las tallas existan
            tallas_producto = []
            tallas_invalidas = []
            for nombre_talla in prod_data['tallas']:
                talla_obj = tallas_objs.get(nombre_talla)
                if talla_obj:
                    tallas_producto.append(talla_obj)
                else:
                    tallas_invalidas.append(nombre_talla)

            if tallas_invalidas:
                self.stdout.write(self.style.WARNING(f"  -> Omitido: Tallas no encontradas ({', '.join(tallas_invalidas)}) para SKU {sku}."))
                continue

            # Crear o actualizar el producto principal
            producto, created = Producto.objects.update_or_create(
                sku=sku,
                defaults={
                    'nombre': prod_data['nombre'],
                    'descripcion': prod_data['descripcion'],
                    'precio_base': prod_data['precio_base'],
                    'en_oferta': prod_data['en_oferta'],
                    'descuento_porcentaje': prod_data['descuento_porcentaje'],
                    'categoria': categoria_obj,
                    'genero': genero_obj,
                    'temporada': temporada_obj,
                    'marca': marca_obj,
                }
            )

            # Actualizar el stock: Borrar el antiguo y crear el nuevo
            ProductoTallaStock.objects.filter(producto=producto).delete()
            stocks_para_crear = []
            for i, talla_obj in enumerate(tallas_producto):
                stock_valor = prod_data['stocks'][i]
                stocks_para_crear.append(
                    ProductoTallaStock(producto=producto, talla=talla_obj, stock=stock_valor)
                )

            if stocks_para_crear:
                ProductoTallaStock.objects.bulk_create(stocks_para_crear)
                self.stdout.write(f"  -> Stock actualizado para {len(stocks_para_crear)} tallas.")

            if created:
                productos_creados += 1
                self.stdout.write(self.style.SUCCESS(f"  -> ¡Producto CREADO!"))
            else:
                productos_actualizados += 1
                self.stdout.write(self.style.NOTICE(f"  -> Producto ACTUALIZADO.")) # Notice para diferenciar

        self.stdout.write(self.style.SUCCESS(f'--- Proceso finalizado ---'))
        self.stdout.write(self.style.SUCCESS(f'✅ Productos Creados: {productos_creados}'))
        self.stdout.write(self.style.SUCCESS(f'🔄 Productos Actualizados: {productos_actualizados}'))
