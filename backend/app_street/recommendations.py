import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Motor de recomendaciones basado en filtrado de contenido.
    Se inicializa una sola vez al cargar Django para optimizar rendimiento.
    """

    def __init__(self):
        self.similarity_matrix = None
        self.product_id_to_index = {}
        self.index_to_product_id = {}
        self.df = None
        self.is_initialized = False
        self.initialize()

    def initialize(self):
        """Inicializa el motor cargando datos y creando matrices de similitud."""
        try:
            self.load_product_data()
            self.create_feature_pipeline()
            self.is_initialized = True
            logger.info(f"Motor de recomendaciones inicializado con {len(self.df)} productos")
        except Exception as e:
            logger.error(f"Error inicializando motor de recomendaciones: {e}")
            self.is_initialized = False

    def load_product_data(self):
        """Carga todos los productos desde la BD en un DataFrame."""
        from .models import Producto

        productos = Producto.objects.select_related(
            'categoria', 'marca', 'genero', 'temporada'
        ).all()

        data = []
        for idx, prod in enumerate(productos):
            data.append({
                'id': str(prod.id),
                'nombre': prod.nombre or '',
                'descripcion': prod.descripcion or '',
                'categoria': prod.categoria.nombre if prod.categoria else 'Sin categoría',
                'marca': prod.marca.nombre if prod.marca else 'Sin marca',
                'genero': prod.genero.nombre if prod.genero else 'Sin género',
                'precio_base': float(prod.precio_base) if prod.precio_base else 0.0,
                'descuento_porcentaje': prod.descuento_porcentaje or 0,
            })
            # Mapeo ID -> Índice y viceversa
            self.product_id_to_index[str(prod.id)] = idx
            self.index_to_product_id[idx] = str(prod.id)

        self.df = pd.DataFrame(data)
        logger.info(f"Datos cargados: {len(self.df)} productos")

    def create_feature_pipeline(self):
        """
        Crea un pipeline de features usando ColumnTransformer.
        - Texto: TfidfVectorizer
        - Categorías: OneHotEncoder
        - Números: MinMaxScaler
        """
        # Pipeline de transformaciones
        preprocessor = ColumnTransformer(
            transformers=[
                # Texto: nombre + descripción
                ('tfidf_text', TfidfVectorizer(
                    max_features=50,
                    stop_words='english',
                    lowercase=True,
                    analyzer='word'
                ), 'nombre'),  # Podría incluir descripción con concatenación

                # Categorías
                ('onehot_cat', OneHotEncoder(
                    handle_unknown='ignore',
                    sparse_output=True
                ), ['categoria', 'marca', 'genero']),

                # Números (precio y descuento)
                ('scaler_num', MinMaxScaler(), ['precio_base', 'descuento_porcentaje'])
            ],
            remainder='drop'
        )

        # Ajustar y transformar
        try:
            feature_matrix = preprocessor.fit_transform(self.df)
            feature_matrix = feature_matrix.toarray()  # Convertir a denso para cálculos

            # Calcular matriz de similitud (coseno)
            self.similarity_matrix = cosine_similarity(feature_matrix)
            logger.info(f"Matriz de similitud calculada: {self.similarity_matrix.shape}")

        except Exception as e:
            logger.error(f"Error en el pipeline de features: {e}")
            raise

    def get_recommendations(self, product_id: str, n: int = 8):
        """
        Obtiene las N recomendaciones más similares para un producto.

        Args:
            product_id: UUID del producto
            n: Número de recomendaciones (default 8)

        Returns:
            Lista de UUIDs de productos similares (ordenados por similitud)
        """
        if not self.is_initialized:
            logger.warning("Motor de recomendaciones no inicializado")
            return []

        # Buscar índice del producto
        if product_id not in self.product_id_to_index:
            logger.warning(f"Producto {product_id} no encontrado")
            return []

        product_idx = self.product_id_to_index[product_id]

        # Obtener fila de similitud
        similarities = self.similarity_matrix[product_idx]

        # Obtener los índices ordenados (descendente), excluyendo el producto actual
        similar_indices = np.argsort(similarities)[::-1][1:n+1]

        # Convertir índices a UUIDs
        recommended_ids = [
            self.index_to_product_id[idx]
            for idx in similar_indices
            if idx in self.index_to_product_id
        ]

        return recommended_ids


# Instancia global del motor (singleton)
recommendation_engine = RecommendationEngine()