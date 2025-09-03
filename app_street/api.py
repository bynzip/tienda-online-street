from rest_framework.viewsets import ModelViewSet
from app_street.models import Producto
from app_street.serializers import ProductSerializer

class ProductViewSet(ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductSerializer