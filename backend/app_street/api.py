# En backend/app_street/api.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Producto, Categoria, Marca, Talla, Genero, Temporada
from django_filters.rest_framework import DjangoFilterBackend
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
from .recommendations import recommendation_engine


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
    """
    Gestiona las acciones para Productos e incluye búsqueda y recomendaciones.
    """
    queryset = Producto.objects.all().prefetch_related('imagenes', 'talla_stock')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'sku', 'descripcion', 'marca__nombre']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductoListSerializer
        
        if self.action in ['create', 'update', 'partial_update']:
            return ProductoWriteSerializer
            
        return ProductoDetailSerializer

    @action(detail=True, methods=['get'], url_path='recommend')
    def recommend(self, request, pk=None):
        """
        Endpoint: GET /api/productos/{id}/recommend/
        Retorna una lista de 8 productos similares al producto consultado.
        """
        try:
            # Validar que el producto existe
            producto = self.get_object()
            product_id = str(producto.id)

            # Obtener IDs de productos similares del motor
            recommended_ids = recommendation_engine.get_recommendations(
                product_id=product_id,
                n=8
            )

            if not recommended_ids:
                return Response(
                    {'error': 'No se encontraron recomendaciones'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Consultar los productos recomendados manteniendo el orden
            # Crear un diccionario para mantener el orden
            productos_dict = {
                str(p.id): p
                for p in Producto.objects.filter(id__in=recommended_ids)
                .prefetch_related('imagenes', 'talla_stock')
            }

            # Reordenar según el orden devuelto por el motor
            productos_ordenados = [
                productos_dict[prod_id]
                for prod_id in recommended_ids
                if prod_id in productos_dict
            ]

            # Serializar usando ProductoListSerializer
            serializer = ProductoListSerializer(
                productos_ordenados,
                many=True,
                context={'request': request}
            )

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Producto.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al obtener recomendaciones: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Mantener los demás ViewSets sin cambios
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
