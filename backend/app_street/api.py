from rest_framework.viewsets import ModelViewSet
from app_street.models import Producto
from app_street.serializers import ProductSerializer
from rest_framework import filters

class ProductViewSet(ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'sku', 'descripcion', 'marca__nombre']