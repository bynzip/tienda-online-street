import random
from django.core.management.base import BaseCommand
from app_street.models import Categoria, Genero, Temporada, Marca, Talla

# Lista de datos a crear
CATEGORIAS = ["Polos", "Pantalones", "Zapatillas", "Accesorios", "Poleras"]
GENEROS = ["Hombre", "Mujer", "Unisex"]
TEMPORADAS = ["Verano 2025", "Invierno 2025", "Todo el Año"]
MARCAS = ["Nike", "Adidas", "StreetForce", "UrbanStyle", "Supreme"]
TALLAS_ROPA = ["XS", "S", "M", "L", "XL"]
TALLAS_CALZADO = ["38", "39", "40", "41", "42", "43", "44"]

class Command(BaseCommand):
    help = 'Crea datos iniciales para las tablas de clasificación (Categorías, Marcas, etc.)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Iniciando la creación de datos de prueba ---'))

        # Usamos get_or_create para no duplicar datos si el comando se ejecuta de nuevo
        for nombre_cat in CATEGORIAS:
            Categoria.objects.get_or_create(nombre=nombre_cat)
        self.stdout.write(self.style.SUCCESS(f'✅ {len(CATEGORIAS)} Categorías creadas/verificadas.'))

        for nombre_gen in GENEROS:
            Genero.objects.get_or_create(nombre=nombre_gen)
        self.stdout.write(self.style.SUCCESS(f'✅ {len(GENEROS)} Géneros creados/verificados.'))

        for nombre_temp in TEMPORADAS:
            Temporada.objects.get_or_create(nombre=nombre_temp)
        self.stdout.write(self.style.SUCCESS(f'✅ {len(TEMPORADAS)} Temporadas creadas/verificadas.'))

        for nombre_marca in MARCAS:
            Marca.objects.get_or_create(nombre=nombre_marca)
        self.stdout.write(self.style.SUCCESS(f'✅ {len(MARCAS)} Marcas creadas/verificadas.'))
        
        tallas_totales = TALLAS_ROPA + TALLAS_CALZADO
        for nombre_talla in tallas_totales:
            Talla.objects.get_or_create(nombre=nombre_talla)
        self.stdout.write(self.style.SUCCESS(f'✅ {len(tallas_totales)} Tallas creadas/verificadas.'))


        self.stdout.write(self.style.SUCCESS('--- Proceso finalizado ---'))
