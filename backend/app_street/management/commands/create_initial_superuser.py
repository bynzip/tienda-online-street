from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Crea un superusuario inicial si no existe, usando variables de entorno.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin') # Valor por defecto 'admin'
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com') # Email por defecto
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD') # La contraseña SÍ debe estar en variable de entorno

        if not password:
            self.stdout.write(self.style.ERROR('La variable de entorno DJANGO_SUPERUSER_PASSWORD no está configurada.'))
            return # Salir si no hay contraseña

        if not User.objects.filter(username=username).exists():
            self.stdout.write(f"Creando superusuario inicial: {username}")
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS(f"Superusuario {username} creado exitosamente."))
        else:
            self.stdout.write(self.style.WARNING(f"Superusuario {username} ya existe, no se creó uno nuevo."))

