from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login

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
    """
    Gestiona las acciones para Productos e incluye búsqueda.
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


# --- Vistas de API para Autenticación ---

class LoginView(APIView):
    """
    Gestiona el inicio de sesión de los usuarios.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": f"Welcome back, {user.username}!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials. Please try again."}, status=status.HTTP_400_BAD_REQUEST)