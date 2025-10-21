from rest_framework import serializers
from app_street.models import Producto, ProductoTallaStock, Talla, ImagenProducto
from django.core.exceptions import ValidationError
from .models import (
    Categoria, Genero, Temporada, Marca, Talla,
    Producto, ProductoTallaStock, ImagenProducto
)

# ===================================================================
# --- SERIALIZERS PARA LEER DATOS (GET) ---
# Optimizados para MOSTRAR la información de manera limpia.
# ===================================================================

# --- Serializers de Clasificación ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'

class TemporadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temporada
        fields = '__all__'

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'

class TallaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla
        fields = '__all__'

# --- Serializers Anidados para Lectura de Productos ---
class ImagenProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = ['id', 'imagen', 'principal']

class ProductoTallaStockSerializer(serializers.ModelSerializer):
    # Muestra el nombre de la talla (ej: "S") en lugar de su ID.
    talla = serializers.StringRelatedField()
    class Meta:
        model = ProductoTallaStock
        fields = ['id', 'talla', 'stock']

# --- Serializer para Listas de Productos (Ligero) ---
class ProductoListSerializer(serializers.ModelSerializer):
    """
    PARA MOSTRAR LISTAS DE PRODUCTOS (GET /api/productos/). Es rápido y ligero.
    """
    marca = serializers.StringRelatedField()
    precio_final = serializers.ReadOnlyField()
    imagen_principal = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'marca', 'precio_final', 'en_oferta', 'imagen_principal']

    def get_imagen_principal(self, obj):
        imagen_obj = obj.imagenes.filter(principal=True).first()
        if imagen_obj and imagen_obj.imagen:
            request = self.context.get('request')
            # Construye la URL completa de la imagen
            return request.build_absolute_uri(imagen_obj.imagen.url) if request else imagen_obj.imagen.url
        return None

# --- Serializer para Detalle de un Producto (Completo) ---
class ProductoDetailSerializer(serializers.ModelSerializer):
    """
    PARA MOSTRAR UN SOLO PRODUCTO CON TODO SU DETALLE (GET /api/productos/1/).
    """
    # Muestra los nombres de las relaciones en lugar de los IDs
    categoria = serializers.StringRelatedField()
    genero = serializers.StringRelatedField()
    temporada = serializers.StringRelatedField()
    marca = serializers.StringRelatedField()
    
    # Anida la información completa de imágenes y stock por talla
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    talla_stock = ProductoTallaStockSerializer(many=True, read_only=True)
    
    # Incluye campos calculados desde el modelo
    precio_final = serializers.ReadOnlyField()
    stock_total = serializers.IntegerField(source='get_stock_total', read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'sku', 'nombre', 'descripcion',
            'precio_base', 'en_oferta', 'descuento_porcentaje', 'precio_final',
            'categoria', 'genero', 'temporada', 'marca',
            'stock_total', 'talla_stock', 'imagenes'
        ]

# ===================================================================
# --- SERIALIZER PARA ESCRIBIR DATOS (POST, PUT, PATCH) ---
# Optimizado para CREAR Y ACTUALIZAR productos desde un formulario.
# ===================================================================

class ProductoWriteSerializer(serializers.ModelSerializer):
    """
    PARA CREAR Y ACTUALIZAR PRODUCTOS (POST, PUT, PATCH).
    Acepta tallas y stocks como texto ("S,M,L") y los procesa.
    """
    # Campos virtuales que solo se usan para escribir (write_only=True)
    tallas = serializers.CharField(write_only=True, required=True, help_text="Nombres de tallas separadas por comas (ej: S,M,L)")
    stocks = serializers.CharField(write_only=True, required=True, help_text="Stocks correspondientes separados por comas (ej: 10,20,15)")
    imagenes = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    
    # Permite asignar relaciones usando su ID
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())
    genero = serializers.PrimaryKeyRelatedField(queryset=Genero.objects.all())
    temporada = serializers.PrimaryKeyRelatedField(queryset=Temporada.objects.all())
    marca = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all())

    class Meta:
        model = Producto
        fields = [
            'sku', 'nombre', 'descripcion', 'precio_base', 'en_oferta',
            'descuento_porcentaje', 'categoria', 'genero', 'temporada', 'marca',
            'tallas', 'stocks', 'imagenes' # Campos virtuales
        ]

    def validate(self, data):
        # Tu excelente lógica de validación, sin cambios.
        tallas_list = [t.strip() for t in data['tallas'].split(',') if t.strip()]
        stocks_list = [s.strip() for s in data['stocks'].split(',') if s.strip()]

        if len(tallas_list) != len(stocks_list):
            raise serializers.ValidationError("La cantidad de tallas debe coincidir con la cantidad de stocks.")

        try:
            stocks_int = [int(stock) for stock in stocks_list]
            if any(stock < 0 for stock in stocks_int):
                raise serializers.ValidationError("Los stocks no pueden ser negativos.")
        except ValueError:
            raise serializers.ValidationError("Los stocks deben ser números enteros.")

        existing_tallas = set(Talla.objects.values_list('nombre', flat=True))
        invalid_tallas = [t for t in tallas_list if t not in existing_tallas]
        if invalid_tallas:
            raise serializers.ValidationError(f"Las tallas no existen: {', '.join(invalid_tallas)}.")

        # Guardamos los datos ya procesados para usarlos en create/update
        data['processed_tallas'] = tallas_list
        data['processed_stocks'] = stocks_int
        return data

    def create(self, validated_data):
        # Extraemos los datos procesados que no son del modelo Producto
        processed_tallas = validated_data.pop('processed_tallas')
        processed_stocks = validated_data.pop('processed_stocks')
        imagenes = validated_data.pop('imagenes', [])
        # Limpiamos los campos virtuales originales
        validated_data.pop('tallas', None)
        validated_data.pop('stocks', None)

        # Creamos el producto principal
        producto = Producto.objects.create(**validated_data)

        # Creamos el stock y las imágenes
        self._create_stock_and_images(producto, processed_tallas, processed_stocks, imagenes)
        
        return producto

    def update(self, instance, validated_data):
        # Tu lógica de actualización, ligeramente refactorizada
        processed_tallas = validated_data.pop('processed_tallas', [])
        processed_stocks = validated_data.pop('processed_stocks', [])
        imagenes = validated_data.pop('imagenes', None) # None si no se envían
        
        validated_data.pop('tallas', None)
        validated_data.pop('stocks', None)

        # Actualiza los campos del modelo Producto
        instance = super().update(instance, validated_data)

        # Actualiza stock e imágenes solo si se proporcionaron
        if processed_tallas and processed_stocks:
             instance.talla_stock.all().delete() # Borra lo antiguo
             self._create_stock_and_images(instance, processed_tallas, processed_stocks, [])

        if imagenes is not None:
            instance.imagenes.all().delete() # Borra las antiguas
            self._create_stock_and_images(instance, [], [], imagenes)
            
        return instance
    
    def _create_stock_and_images(self, producto, tallas, stocks, imagenes):
        # Función auxiliar para crear stock
        for talla_nombre, stock_val in zip(tallas, stocks):
            talla_obj = Talla.objects.get(nombre=talla_nombre)
            ProductoTallaStock.objects.create(producto=producto, talla=talla_obj, stock=stock_val)

        # Función auxiliar para crear imágenes
        for i, imagen_file in enumerate(imagenes):
            ImagenProducto.objects.create(
                producto=producto,
                imagen=imagen_file,
                principal=(i == 0) # La primera imagen es la principal
            )