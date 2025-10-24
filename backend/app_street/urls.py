from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api import (
    # Importa todos tus ViewSets
    ProductoViewSet,
    CategoriaViewSet,
    MarcaViewSet,
    TallaViewSet,
    GeneroViewSet,
    TemporadaViewSet,
    # Y también la nueva vista de Login
    LoginView,
)

# El router registrará las URLs para los ViewSets
router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='product')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'marcas', MarcaViewSet, basename='marcas')
router.register(r'tallas', TallaViewSet, basename='tallas')
router.register(r'generos', GeneroViewSet, basename='generos')
router.register(r'temporadas', TemporadaViewSet, basename='temporadas')

# Lista final de URLs para la aplicación
urlpatterns = [
    # Rutas de vistas normales
    path('', views.administrador, name="administrador"),
    
    # --- 👇👇 AQUÍ ESTÁ LA NUEVA RUTA AÑADIDA 👇👇 ---
    path('gestion-atributos/', views.gestion_atributos, name='gestion_atributos'),
    
    path('export/', views.ProductExportView.as_view(), name='product-export'),
    path('import/', views.ProductImportView.as_view(), name='product-import'),

    # Rutas de la API generadas por el router
    path('api/', include(router.urls)),

    # Ruta específica para la API de Login
    path('api/login/', LoginView.as_view(), name='api_login'),
]