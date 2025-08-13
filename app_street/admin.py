

from django.contrib import admin
from .models import Producto, Categoria, Marca, Genero, Temporada, ImagenProducto
admin.site.register(Producto)
admin.site.register(Categoria)
admin.site.register(Marca)
admin.site.register(Genero)
admin.site.register(Temporada)
admin.site.register(ImagenProducto)