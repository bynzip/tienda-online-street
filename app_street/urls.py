from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import ProductViewSet
from . import views

router = DefaultRouter()
router.register(r'productos', ProductViewSet, basename='product')

urlpatterns = [
    path('', views.inicio, name = "inicio"),
    path('api/', include(router.urls)),
    path('export/', views.ProductExportView.as_view(), name='product-export'),
    path('import/', views.ProductImportView.as_view(), name='product-import'),
]