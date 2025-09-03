# street_peru/urls.py
from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD
from django.conf import settings  # <-- Agrega esta línea
from django.conf.urls.static import static 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app_street.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app_street.urls'))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
>>>>>>> main
