<<<<<<< HEAD
# productos/urls.py
from django.urls import path
=======
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import ProductViewSet
>>>>>>> main
from . import views

router = DefaultRouter()
router.register(r'productos', ProductViewSet, basename='product')

urlpatterns = [
<<<<<<< HEAD
    path('', views.inicio, name="inicio"),
    path("importar/", views.importar_productos_excel, name="importar_productos"),
    path("exportar/", views.exportar_productos_excel, name="exportar_productos"),
]
=======
    path('', views.inicio, name = "inicio"),
    path('api/', include(router.urls)),
    path('export/', views.ProductExportView.as_view(), name='product-export'),
    path('import/', views.ProductImportView.as_view(), name='product-import'),
]
>>>>>>> main
