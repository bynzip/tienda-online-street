import os
import re
from collections import defaultdict
from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.conf import settings
from app_street.models import Producto, ImagenProducto

# Regex para extraer el nombre base y el índice de las imágenes
# (Misma lógica que el script de generación de CSV)
image_regex = re.compile(r'^(.*?)(?:[-_ ](\d+)|(\d+))?\.(webp|avif|png|jpe?g)$', re.IGNORECASE)

class Command(BaseCommand):
    help = 'Vincula las imágenes de la carpeta "imagenes" con los productos existentes en la base de datos.'

    def handle(self, *args, **options):
        # 1. Definir la ruta a la carpeta 'imagenes'
        # Asumimos que 'backend' está en la raíz del proyecto, y 'imagenes' también.
        BASE_DIR = settings.BASE_DIR # Esta es la carpeta 'backend'
        IMAGENES_SOURCE_DIR = os.path.join(BASE_DIR, '..', 'imagenes')
        
        if not os.path.exists(IMAGENES_SOURCE_DIR):
            self.stdout.write(self.style.ERROR(f"Error: El directorio '{IMAGENES_SOURCE_DIR}' no se encuentra."))
            self.stdout.write(self.style.WARNING("Asegúrate de que la carpeta 'imagenes' esté en la raíz del proyecto, al mismo nivel que 'backend' y 'frontend'."))
            return

        self.stdout.write(f"Escanenando directorio '{IMAGENES_SOURCE_DIR}'...")

        # 2. Escanear todas las imágenes y agruparlas por producto
        scanned_products = defaultdict(list)
        for marca_folder in os.listdir(IMAGENES_SOURCE_DIR):
            marca_path = os.path.join(IMAGENES_SOURCE_DIR, marca_folder)
            if os.path.isdir(marca_path):
                for filename in os.listdir(marca_path):
                    match = image_regex.match(filename)
                    if match:
                        base_name = match.group(1).strip()
                        index_str = match.group(2) or match.group(3)
                        index = int(index_str) if index_str else 1
                        
                        if not base_name:
                             # Si el nombre es vacío (ej: "1.jpg"), intenta usar el nombre de la carpeta
                            base_name = marca_folder.capitalize()

                        full_path = os.path.join(marca_path, filename)
                        scanned_products[base_name].append({
                            'index': index,
                            'path': full_path,
                            'filename': filename
                        })

        self.stdout.write(f"Se encontraron {len(scanned_products)} productos únicos en las imágenes.")

        # 3. Iterar sobre los productos encontrados y vincularlos
        productos_vinculados = 0
        imagenes_vinculadas = 0
        
        for base_name, images_list in scanned_products.items():
            try:
                # Buscar el producto en la BD por el nombre base
                producto = Producto.objects.get(nombre=base_name)
            except Producto.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'-> Producto "{base_name}" no encontrado en la BD. Saltando.'))
                continue
            except Producto.MultipleObjectsReturned:
                self.stdout.write(self.style.ERROR(f'-> ERROR: Hay múltiples productos llamados "{base_name}". No se puede vincular. Saltando.'))
                continue

            # 4. Si se encuentra, eliminar imágenes antiguas y crear las nuevas
            try:
                # Eliminar las imágenes antiguas para evitar duplicados
                ImagenProducto.objects.filter(producto=producto).delete()
                
                # Ordenar las imágenes por su índice
                sorted_images = sorted(images_list, key=lambda x: x['index'])
                
                img_count_prod = 0
                for img_data in sorted_images:
                    src_path = img_data['path']
                    filename = img_data['filename']
                    is_principal = (img_data['index'] == 1)
                    
                    # Abrir el archivo y dárselo a Django
                    with open(src_path, 'rb') as f:
                        django_file = File(f, name=filename)
                        
                        ImagenProducto.objects.create(
                            producto=producto,
                            imagen=django_file, # Django lo copiará a 'media/productos/'
                            principal=is_principal
                        )
                        img_count_prod += 1
                        imagenes_vinculadas += 1

                self.stdout.write(self.style.SUCCESS(f'-> Vinculadas {img_count_prod} imágenes para "{base_name}".'))
                productos_vinculados += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'-> ERROR al procesar imágenes para "{base_name}": {e}'))

        self.stdout.write(self.style.SUCCESS(f"\nProceso completado: {imagenes_vinculadas} imágenes vinculadas para {productos_vinculados} productos."))