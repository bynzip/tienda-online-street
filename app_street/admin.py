from django.contrib import admin
from django.utils.html import format_html
from .models import Categoria, Genero, Temporada, Marca, Producto, ImagenProducto

class ImagenProductoInline(admin.TabularInline):
    model = ImagenProducto
    extra = 1
    readonly_fields = ('imagen_preview',)

    def imagen_preview(self, obj):
        if obj.url_imagen:
            return format_html('<img src="{}" style="max-width: 150px; max-height: 150px;" />', obj.url_imagen)
        return "No hay imagen"
    imagen_preview.short_description = 'Vista Previa'


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'marca', 'categoria', 'precio', 'stock', 'talla', 'color')
    list_filter = ('categoria', 'marca', 'genero', 'temporada', 'talla', 'color')
    search_fields = ('nombre', 'descripcion', 'marca__nombre')
    list_per_page = 25
    inlines = [ImagenProductoInline]

    fieldsets = (
        (None, {
            'fields': ('nombre', 'descripcion')
        }),
        ('Clasificación', {
            'fields': ('categoria', 'genero', 'temporada', 'marca')
        }),
        ('Detalles del Producto', {
            'fields': ('color', 'talla', 'precio', 'stock')
        }),
    )


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pais_origen')
    search_fields = ('nombre',)


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    search_fields = ('nombre',)


@admin.register(Temporada)
class TemporadaAdmin(admin.ModelAdmin):
    search_fields = ('nombre',)