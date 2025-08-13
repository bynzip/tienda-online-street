# productos/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name="inicio"),
    path("importar/", views.importar_productos_excel, name="importar_productos"),
    path("exportar/", views.exportar_productos_excel, name="exportar_productos"),
]
