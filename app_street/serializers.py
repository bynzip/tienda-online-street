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

    def validate(self, attrs):
        tallas_str = attrs.get('tallas')
        stocks_str = attrs.get('stocks')

        tallas_list = [t.strip() for t in tallas_str.split(',') if t.strip()]
        stocks_list = [s.strip() for s in stocks_str.split(',') if s.strip()]

        if len(tallas_list) != len(stocks_list):
            raise ValidationError("El número de tallas debe coincidir con el número de stocks.")

        try:
            stocks_int = [int(stock) for stock in stocks_list]
            if any(stock < 0 for stock in stocks_int):
                raise ValidationError("Los stocks deben ser números positivos.")
        except ValueError:
            raise ValidationError("Los stocks deben ser números enteros válidos.")

        existing_tallas = Talla.objects.values_list('nombre', flat=True)
        invalid_tallas = [t for t in tallas_list if t not in existing_tallas]
        if invalid_tallas:
            raise ValidationError(
                f"Las siguientes tallas no existen: {', '.join(invalid_tallas)}."
            )

        # Guardar resultados ya procesados en attrs para reusarlos en create/update
        attrs['tallas_list'] = tallas_list
        attrs['stocks_int'] = stocks_int

        return attrs
    
    def create(self, validated_data):
        tallas_list = validated_data.pop('tallas_list')
        stocks_int = validated_data.pop('stocks_int')
        imagenes = validated_data.pop('imagenes', [])

        # Limpieza para que no reviente
        validated_data.pop('tallas', None)
        validated_data.pop('stocks', None)

        producto = Producto.objects.create(**validated_data)

        for talla_nombre, stock in zip(tallas_list, stocks_int):
            talla = Talla.objects.get(nombre=talla_nombre)
            ProductoTallaStock.objects.create(producto=producto, talla=talla, stock=stock)

        for idx, imagen in enumerate(imagenes):
            ImagenProducto.objects.create(
                producto=producto,
                imagen=imagen,
                principal=(idx == 0)
            )

        return producto

    def update(self, instance, validated_data):
        tallas_list = validated_data.pop('tallas_list')
        stocks_int = validated_data.pop('stocks_int')
        imagenes = validated_data.pop('imagenes', [])

        # 👇 Limpieza para que no reviente
        validated_data.pop('tallas', None)
        validated_data.pop('stocks', None)

        # Actualizar campos básicos del producto
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Eliminar tallas/stocks anteriores y crear nuevos
        ProductoTallaStock.objects.filter(producto=instance).delete()
        for talla_nombre, stock in zip(tallas_list, stocks_int):
            talla = Talla.objects.get(nombre=talla_nombre)
            ProductoTallaStock.objects.create(producto=instance, talla=talla, stock=stock)

        # Si se proporcionan nuevas imágenes, reemplazar las existentes
        if imagenes:
            instance.imagenes.all().delete()  # Eliminar imágenes anteriores
            for idx, imagen in enumerate(imagenes):
                ImagenProducto.objects.create(
                    producto=instance,
                    imagen=imagen,
                    principal=(idx == 0)
                )

        return instance

    def to_representation(self, instance):
        # Para respuestas GET, agregamos tallas y stocks como strings
        representation = super().to_representation(instance)
        talla_stocks = instance.talla_stock.all()
        representation['tallas'] = ', '.join([ts.talla.nombre for ts in talla_stocks])
        representation['stocks'] = ', '.join([str(ts.stock) for ts in talla_stocks])
        representation['imagenes'] = [img.imagen.url for img in instance.imagenes.all()]
        return representation