from django.core.management.base import BaseCommand
from app_street.models import Categoria

class Command(BaseCommand):
    help = 'Elimina todas las categorías existentes y crea las 10 categorías generales nuevas.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Iniciando proceso de reseteo de categorías...'))

        # 1. Eliminar categorías existentes
        # Como en models.py está on_delete=models.SET_NULL, los productos quedarán huerfanos (sin borrar)
        count_deleted, _ = Categoria.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'✅ Se eliminaron {count_deleted} categorías antiguas.'))

        # 2. Definir las nuevas categorías generales
        nuevas_categorias = [
            "Poleras y Casacas",
            "Polos y Camisetas",
            "Pantalones",
            "Shorts",
            "Zapatillas Lifestyle",
            "Calzado Deportivo",
            "Mochilas y Bolsos",
            "Accesorios",
            "Conjuntos",
            "Ropa Interior"
        ]

        # 3. Crear las nuevas categorías
        self.stdout.write('Creando nuevas categorías...')
        for nombre_cat in nuevas_categorias:
            Categoria.objects.create(nombre=nombre_cat)
            self.stdout.write(f'  - Creada: {nombre_cat}')

        self.stdout.write(self.style.SUCCESS('✨ ¡Listo! Categorías actualizadas correctamente.'))