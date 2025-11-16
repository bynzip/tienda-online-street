from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto, Categoria, Marca, Talla, Genero, Temporada
from .serializers import (
    ProductoListSerializer,
    ProductoDetailSerializer,
    ProductoWriteSerializer,
    CategoriaSerializer,
    MarcaSerializer,
    TallaSerializer,
    GeneroSerializer,
    TemporadaSerializer
)

# --- ViewSets para los Modelos ---

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().prefetch_related('imagenes', 'talla_stock').order_by('-fecha_registro')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [
        DjangoFilterBackend, # Para filtros por campo
        filters.SearchFilter, # Para la búsqueda general
        filters.OrderingFilter # Para ordenamiento
    ]

    filterset_fields = ['categoria', 'marca', 'genero', 'en_oferta', 'temporada']
    search_fields = ['nombre', 'sku', 'descripcion', 'marca__nombre', 'categoria__nombre', 'genero__nombre', 'temporada__nombre']
    ordering_fields = ['fecha_registro', 'precio_base', 'nombre']
    ordering = ['-fecha_registro']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductoListSerializer
        
        if self.action in ['create', 'update', 'partial_update']:
            return ProductoWriteSerializer
            
        return ProductoDetailSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TallaViewSet(viewsets.ModelViewSet):
    queryset = Talla.objects.all()
    serializer_class = TallaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TemporadaViewSet(viewsets.ModelViewSet):
    queryset = Temporada.objects.all()
    serializer_class = TemporadaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
