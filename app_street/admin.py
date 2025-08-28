from django.contrib import admin
from .models import (
    Producto, Categoria, Genero, Temporada, Marca, 
    Talla, ProductoTallaStock, ImagenProducto
)

# 1. Creamos un "Inline" para gestionar el stock por talla
# Esto te permitirá añadir/editar/borrar tallas y stock desde la página del producto
class ProductoTallaStockInline(admin.TabularInline):
    model = ProductoTallaStock
    extra = 1  # Cuántos campos vacíos para añadir nuevas tallas mostrar
    autocomplete_fields = ['talla'] # Un buscador para las tallas, más cómodo

# Otro Inline para las imágenes
class ImagenProductoInline(admin.StackedInline):
    model = ImagenProducto
    extra = 1

# 2. Modificamos el ProductoAdmin
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # Campos que se mostrarán en la lista de productos
    list_display = (
        'sku', 
        'nombre', 
        'marca',
        'precio_base', 
        'en_oferta',
        'precio_final', # El método @property funciona aquí directamente
        'stock_total',  # Usaremos un método para mostrar el stock total
    )
    # Filtros que aparecerán a la derecha
    list_filter = ('marca', 'categoria', 'genero', 'en_oferta')
    # Campos de búsqueda
    search_fields = ('nombre', 'sku', 'marca__nombre')
    # Añadimos los inlines
    inlines = [ProductoTallaStockInline, ImagenProductoInline]

    # Método para mostrar el stock total en el list_display
    def stock_total(self, obj):
        return obj.get_stock_total()
    
    # Ayuda a que la columna de stock total se pueda ordenar
    stock_total.admin_order_field = 'stock_tallas__stock' 
    stock_total.short_description = 'Stock Total'


# Registra los otros modelos para que aparezcan en el admin
admin.site.register(Categoria)
admin.site.register(Genero)
admin.site.register(Temporada)
admin.site.register(Marca)

@admin.register(Talla)
class TallaAdmin(admin.ModelAdmin):
    # Habilita un campo de búsqueda para el modelo Talla
    search_fields = ('nombre',)