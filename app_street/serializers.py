from rest_framework import serializers
from app_street.models import Producto, ProductoTallaStock, Talla, ImagenProducto
from django.core.exceptions import ValidationError

class ProductSerializer(serializers.ModelSerializer):
    tallas = serializers.CharField(write_only=True, required=True)  # String como "S, M, L"
    stocks = serializers.CharField(write_only=True, required=True)  # String como "10, 20, 15"
    imagenes = serializers.ListField(  # Nuevo campo para múltiples archivos
        child=serializers.ImageField(), write_only=True, required=False  # No obligatorio
    )

    class Meta:
        model = Producto
        fields = '__all__'
        extra_fields = ['tallas', 'stocks', 'imagenes']

    def create(self, validated_data):
        # Extraemos tallas y stocks del validated_data
        tallas_str = validated_data.pop('tallas')
        stocks_str = validated_data.pop('stocks')
        imagenes = validated_data.pop('imagenes', [])  # Lista de archivos, default vacío

        # Parseamos los strings
        tallas_list = [t.strip() for t in tallas_str.split(',') if t.strip()]
        stocks_list = [s.strip() for s in stocks_str.split(',') if s.strip()]

        # Validamos que coincidan en longitud
        if len(tallas_list) != len(stocks_list):
            raise ValidationError("El número de tallas debe coincidir con el número de stocks.")

        # Validamos que stocks sean números positivos
        try:
            stocks_int = [int(stock) for stock in stocks_list]
            if any(stock < 0 for stock in stocks_int):
                raise ValueError("Los stocks deben ser números positivos.")
        except ValueError:
            raise ValidationError("Los stocks deben ser números enteros válidos.")

        # Validamos que todas las tallas existan en la tabla Talla
        existing_tallas = Talla.objects.values_list('nombre', flat=True)
        invalid_tallas = [t for t in tallas_list if t not in existing_tallas]
        if invalid_tallas:
            raise ValidationError(f"Las siguientes tallas no existen: {', '.join(invalid_tallas)}. Asegúrate de definirlas primero en la tabla de tallas.")

        # Creamos el producto
        producto = Producto.objects.create(**validated_data)

        # Creamos las instancias de ProductoTallaStock
        for talla_nombre, stock in zip(tallas_list, stocks_int):
            talla = Talla.objects.get(nombre=talla_nombre)  # Lanza error si no existe (validado antes)
            ProductoTallaStock.objects.create(
                producto=producto,
                talla=talla,
                stock=stock
            )

        # Manejar imágenes: Subir y crear ImagenProducto
        for idx, imagen in enumerate(imagenes):
            es_principal = (idx == 0)  # Primera imagen es principal
            ImagenProducto.objects.create(
                producto=producto,
                imagen=imagen,  # Django sube el archivo a media/productos/
                principal=es_principal
            )

        return producto

    def to_representation(self, instance):
        # Para respuestas GET, agregamos tallas y stocks como strings
        representation = super().to_representation(instance)
        talla_stocks = instance.talla_stock.all()
        representation['tallas'] = ', '.join([ts.talla.nombre for ts in talla_stocks])
        representation['stocks'] = ', '.join([str(ts.stock) for ts in talla_stocks])
        representation['imagenes'] = [img.imagen.url for img in instance.imagenes.all()]
        return representation