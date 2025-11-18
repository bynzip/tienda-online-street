from django.core.management.base import BaseCommand
from app_street.recommendations import recommendation_engine
import logging

# Configurar un logger para ver la salida del motor
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Fuerza la re-indexación del motor de recomendaciones con los productos actuales en la base de datos.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('--- Iniciando re-indexación del motor de recomendaciones... ---'))
        
        try:
            # Esta es la función clave que reinicia todo
            # (definida en app_street/recommendations.py)
            recommendation_engine.initialize()
            
            # Verificar si se inicializó y cuántos productos cargó
            if recommendation_engine.is_initialized and recommendation_engine.df is not None:
                product_count = len(recommendation_engine.df)
                self.stdout.write(self.style.SUCCESS(f'--- ¡Éxito! Motor re-indexado con {product_count} productos. ---'))
            else:
                self.stdout.write(self.style.WARNING('--- El motor de recomendaciones reportó que no se inicializó correctamente. Revisa los logs. ---'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'--- ¡Error! Ocurrió un problema durante la re-indexación: ---'))
            self.stdout.write(self.style.ERROR(str(e)))
            # También lo mandamos al log de Django
            logger.error(f"Error en comando reindex_recommendations: {e}", exc_info=True)