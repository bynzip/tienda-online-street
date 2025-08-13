from app_street.models import Categoria, Genero, Temporada, Marca

# Limpiar datos existentes (opcional, si quieres resetear)
# Categoria.objects.all().delete()
# Genero.objects.all().delete()
# Temporada.objects.all().delete()
# Marca.objects.all().delete()

# Poblar Categoría
Categoria.objects.get_or_create(nombre="Ropa", descripcion="Ropa de vestir y casual")
Categoria.objects.get_or_create(nombre="Calzado", descripcion="Zapatos, botas y sandalias")
Categoria.objects.get_or_create(nombre="Accesorios", descripcion="Bolsos, gorras y más")

# Poblar Género
Genero.objects.get_or_create(nombre="Hombre")
Genero.objects.get_or_create(nombre="Mujer")
Genero.objects.get_or_create(nombre="Unisex")

# Poblar Temporada
Temporada.objects.get_or_create(nombre="Invierno")
Temporada.objects.get_or_create(nombre="Verano")
Temporada.objects.get_or_create(nombre="Primavera")
Temporada.objects.get_or_create(nombre="Otoño")

# Poblar Marca
Marca.objects.get_or_create(nombre="Adidas", pais_origen="Alemania")
Marca.objects.get_or_create(nombre="Nike", pais_origen="Estados Unidos")
Marca.objects.get_or_create(nombre="Puma", pais_origen="Alemania")
Marca.objects.get_or_create(nombre="Reebok", pais_origen="Estados Unidos")
Marca.objects.get_or_create(nombre="Under Armour", pais_origen="Estados Unidos")

print("Datos iniciales cargados exitosamente el 12 de agosto de 2025 a las 03:04 PM -05.")