import os
import re
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from app_street.models import Producto, ImagenProducto

class Command(BaseCommand):
    help = 'Vincula imágenes usando un mapa de traducción específico (Inglés -> Español/Nombre Archivo).'

    def handle(self, *args, **options):
        BASE_DIR = settings.BASE_DIR
        # Asumiendo que la carpeta 'imagenes' está en la raíz del proyecto (junto a backend)
        IMAGENES_SOURCE_DIR = os.path.join(BASE_DIR, '..', 'imagenes', '2')
        
        # Si la ruta es diferente en tu servidor, ajusta la línea de arriba o mueve las imágenes
        # a una carpeta simple llamada 'imagenes' en la raíz y usa:
        # IMAGENES_SOURCE_DIR = os.path.join(BASE_DIR, '..', 'imagenes')

        if not os.path.exists(IMAGENES_SOURCE_DIR):
            self.stdout.write(self.style.ERROR(f"No encuentro el directorio: {IMAGENES_SOURCE_DIR}"))
            return

        # --- MAPA DE TRADUCCIÓN EXACTO (Basado en tus datos) ---
        # Clave: Nombre del Producto en BD (Excel)
        # Valor: Inicio del nombre del archivo de imagen
        PRODUCT_MAP = {
            "80 Relaxed Hoodie": "Sudadera con capucha RELAJADA 80",
            "Authentic Gear Hoodie": "Sudadera con capucha AUTHENTIC GEAR",
            "Authorized Crew": "Sudadera Authorized Crew",
            "Built To Last Zip Hoodie": "Sudadera con capucha y cremallera Built to Last",
            "Built Tough Zip Hoodie": "Sudadera con capucha con cremallera Built Tough",
            "Champion Oval Zip Hoodie": "Sudadera con capucha y cremallera Champion Oval",
            "Double Stripe Embroidered Hoodie": "Sudadera con capucha bordada de doble raya",
            "Dragon Hoodie": "Sudadera con capucha Dragon",
            "Established Fleece Pant": "PANTALÓN DE FORRO POLAR ESTABLECIDO",
            "Established Zip Hoodie": "SUDADERA CON CREMALLERA ESTABLECIDA",
            "Felt Applique Hoodie": "SUDADERA CON CAPUCHA CON APLICACIONES DE FIELTRO",
            "Faded Graphic Fleece Pant": "Pantalón polar con estampado gráfico desteñido",
            "International Designs Zip Hoodie": "Sudadera con capucha con cremallera International Designs",
            "Long Range Crew": "Sudadera Long Range Crew",
            "Mantra Zip Hoodie": "Sudadera con cremallera MANTRA",
            "Relaxed Crew": "TRIPULACIÓN RELAJADA", # Traducción literal detectada
            "Relaxed Half Zip": "CREMALLERA DE MEDIA RELAJADA",
            "Relaxed Hoodie": "SUDADERA CON CAPUCHA RELAJADA",
            "Relaxed Zip Hoodie": "Sudadera con capucha y cremallera Relaxed",
            "Satin Patch Hoodie": "Sudadera con capucha y parche de satén",
            "Stock Link Crew Pigment Dyed": "ENLACE DE STOCK CREW TEÑIDO CON PIGMENTO",
            "Stock Link Zip Hoodie Pigment Dyed": "SUDADERA CON CAPUCHA Y CREMALLERA STOCK LINK TEÑIDA CON PIGMENTOS",
            "Stock Logo Applique Hoodie": "Sudadera con capucha y aplique del logotipo de stock",
            "Stock Logo Fleece Short": "Pantalón corto de forro polar con el logo de la marca",
            "Stussy 80 Relaxed Hoodie": "Sudadera con capucha STUSSY 80 RELAXED",
            "Stüssy International Zip Hoodie": "Sudadera con capucha y cremallera Stüssy International",
            "Swim Out Zip Hoodie": "Sudadera con capucha y cremallera Swim Out",
            "Tile Oval Hoodie": "Sudadera con capucha ovalada Tile",
            "Workgear Sweatpant": "PANTALÓN DEPORTIVO WORKGEAR",
            "Worldwide Dot Hoodie": "Sudadera con capucha World Wide Dot",
            "Zip Hoodie Faded Graphic": "Sudadera con capucha con cremallera y estampado gráfico desteñido",
            "Bividi para Hombres de Verano – Pack x3": "Bividi para Hombres de Verano",
            "Media Vestir Style": "Media Vestir Style",
            "Media de Vestir Clásica": "Media de Vestir Clásica",
            "Represent Owners Club Tote Bag": "Bolsa de mano del Club de Propietarios",
            "Represent Owners Club Socks": "Calcetines del Club de Propietarios",
            "Represent X 47 Owners Club Cap": "Gorra del Club de Propietarios de X 47",
            # Agregamos manualmente productos que podrían no tener match directo si faltan tildes
            "Bividi para Hombres de Verano": "Bividi para Hombres de Verano",
        }

        self.stdout.write("--- Iniciando vinculación inteligente de imágenes ---")
        
        # Obtener todos los archivos disponibles en la carpeta
        all_files = os.listdir(IMAGENES_SOURCE_DIR)
        
        processed_count = 0

        for prod_name_db, img_base_name in PRODUCT_MAP.items():
            try:
                producto = Producto.objects.get(nombre__iexact=prod_name_db)
            except Producto.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Producto no encontrado en BD: '{prod_name_db}'. Saltando."))
                continue
            
            # Buscar archivos que comiencen con el nombre base de la imagen
            # Normalizamos a minúsculas para evitar problemas de case sensitivity
            matches = []
            for filename in all_files:
                # Limpiamos espacios extra y comparamos el inicio
                if filename.strip().lower().startswith(img_base_name.lower()):
                    matches.append(filename)
            
            if not matches:
                self.stdout.write(self.style.WARNING(f"  -> No se encontraron imágenes para '{prod_name_db}' (Buscado: {img_base_name})"))
                continue

            # Ordenar para intentar que '1' vaya antes que '2'
            # Esto ayuda a que la principal sea la correcta
            matches.sort()

            self.stdout.write(f"Procesando '{prod_name_db}': encontrados {len(matches)} archivos.")
            
            # Limpiar imágenes anteriores para evitar duplicados
            ImagenProducto.objects.filter(producto=producto).delete()

            for index, filename in enumerate(matches):
                file_path = os.path.join(IMAGENES_SOURCE_DIR, filename)
                try:
                    with open(file_path, 'rb') as f:
                        django_file = File(f, name=filename)
                        ImagenProducto.objects.create(
                            producto=producto,
                            imagen=django_file,
                            principal=(index == 0) # La primera (alfabéticamente) será la principal
                        )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error al leer archivo {filename}: {e}"))
            
            processed_count += 1

        self.stdout.write(self.style.SUCCESS(f"\n--- Proceso completado. Productos actualizados: {processed_count} ---"))