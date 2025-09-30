from django.db import models
import uuid
from django.core.validators import MinValueValidator, MaxValueValidator

# --- Modelos de Clasificación ---

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.nombre

class Genero(models.Model):
    nombre = models.CharField(max_length=50)  # Hombre, Mujer, Niño, Niña, Unisex
    def __str__(self):
        return self.nombre

class Temporada(models.Model):
    nombre = models.CharField(max_length=50)  # Invierno, Verano, etc.
    def __str__(self):
        return self.nombre

class Marca(models.Model):
    nombre = models.CharField(max_length=100)
    pais_origen = models.CharField(max_length=100, blank=True, null=True)
    def __str__(self):
        return self.nombre

class Talla(models.Model):
    nombre = models.CharField(max_length=20) # Ej: "S", "M", "42", "43.5"

    def __str__(self):
        return f"{self.nombre}"

# --- Modelos Principales de Producto ---

class Producto(models.Model):
    import uuid
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=100, unique=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    
    # --- Datos de Precio y Ofertas ---
    precio_base = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Precio normal del producto")
    en_oferta = models.BooleanField(default=False, help_text="Marcar si el producto está en oferta")
    descuento_porcentaje = models.PositiveIntegerField(
        default=0, 
        help_text="Porcentaje de descuento (0 a 100)",
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # --- Datos de Clasificación (Relaciones) ---
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    genero = models.ForeignKey(Genero, on_delete=models.SET_NULL, null=True)
    temporada = models.ForeignKey(Temporada, on_delete=models.SET_NULL, null=True)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True)
    
    # --- Datos Adicionales ---
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    @property
    def precio_final(self):
        if self.en_oferta and self.descuento_porcentaje > 0:
            descuento = self.precio_base * (self.descuento_porcentaje / 100)
            return round(self.precio_base - descuento, 2)
        return self.precio_base

    def get_stock_total(self):
        total = ProductoTallaStock.objects.filter(producto=self).aggregate(total=models.Sum('stock'))['total']
        return total or 0

    def __str__(self):
        return f"{self.nombre} ({self.sku})"

class ProductoTallaStock(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="talla_stock")
    talla = models.ForeignKey(Talla, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('producto', 'talla')
        ordering = ['talla__nombre']

    def __str__(self):
        return f"{self.producto.nombre} - Talla: {self.talla.nombre} - Stock: {self.stock}"

class ImagenProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="imagenes")
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    principal = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Imagen de {self.producto.nombre}"