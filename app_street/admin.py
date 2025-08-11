from django.contrib import admin
from .models import Categoria, Genero, Temporada, Marca, Producto, ImagenProducto

admin.site.register(Categoria)
admin.site.register(Genero)
admin.site.register(Temporada)
admin.site.register(Marca)
admin.site.register(Producto)
admin.site.register(ImagenProducto)

