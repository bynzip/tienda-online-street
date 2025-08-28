from django.shortcuts import render
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto, Categoria, Genero, Temporada, Marca, ProductoTallaStock, Talla
from .serializers import ProductSerializer
import io

class ProductExportView(APIView):
    def get(self, request):
        # Obtener todos los productos con sus relaciones
        productos = Producto.objects.all()
        data = []
        for producto in productos:
            producto_data = ProductSerializer(producto).data
            data.append(producto_data)

        # Convertir a DataFrame
        df = pd.DataFrame(data)
        # Asegurar que tallas y stocks sean strings
        df['tallas'] = df['tallas'].fillna('')
        df['stocks'] = df['stocks'].fillna('')

        # Crear archivo Excel en memoria
        output = io.BytesIO()
        df.to_excel(output, index=False, engine='openpyxl')
        output.seek(0)

        # Devolver el archivo como respuesta
        response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="productos_exportados.xlsx"'
        return response

class ProductImportView(APIView):
    def post(self, request):
        if 'excel_file' not in request.FILES:
            return Response({"error": "No se subió ningún archivo Excel"}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['excel_file']
        try:
            # Leer el archivo Excel con pandas
            df = pd.read_excel(excel_file)
        except Exception as e:
            return Response({"error": f"Error al leer el archivo Excel: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Definir las columnas esperadas
        required_columns = ['SKU', 'Nombre', 'Precio Base', 'Tallas', 'Stocks', 'Categoría', 'Género', 'Temporada', 'Marca']
        if not all(col in df.columns for col in required_columns):
            return Response({"error": f"Faltan columnas requeridas. Esperadas: {required_columns}"}, status=status.HTTP_400_BAD_REQUEST)

        results = {"created": 0, "updated": 0, "errors": []}
        for index, row in df.iterrows():
            sku = str(row['SKU']).strip()
            nombre = str(row['Nombre']).strip()
            precio_base = float(row['Precio Base']) if pd.notna(row['Precio Base']) else 0.0
            tallas_str = str(row['Tallas']).strip()
            stocks_str = str(row['Stocks']).strip()
            categoria_id = int(row['Categoría']) if pd.notna(row['Categoría']) else None
            genero_id = int(row['Género']) if pd.notna(row['Género']) else None
            temporada_id = int(row['Temporada']) if pd.notna(row['Temporada']) else None
            marca_id = int(row['Marca']) if pd.notna(row['Marca']) else None

            # Validar tallas y stocks
            tallas_list = [t.strip() for t in tallas_str.split(',') if t.strip()]
            stocks_list = [s.strip() for s in stocks_str.split(',') if s.strip()]
            if len(tallas_list) != len(stocks_list):
                results["errors"].append(f"Fila {index + 2}: El número de tallas ({len(tallas_list)}) no coincide con el de stocks ({len(stocks_list)})")
                continue

            try:
                stocks_int = [int(stock) for stock in stocks_list]
                if any(stock < 0 for stock in stocks_int):
                    raise ValueError("Stocks negativos")
            except ValueError:
                results["errors"].append(f"Fila {index + 2}: Stocks deben ser números enteros positivos")
                continue

            # Validar categorías, géneros, etc. por ID
            categoria = Categoria.objects.filter(id=categoria_id).first()
            genero = Genero.objects.filter(id=genero_id).first()
            temporada = Temporada.objects.filter(id=temporada_id).first()
            marca = Marca.objects.filter(id=marca_id).first()
            if not all([categoria, genero, temporada, marca]):
                results["errors"].append(f"Fila {index + 2}: Uno o más IDs de categoría, género, temporada o marca no existen")
                continue

            # Validar tallas existentes
            existing_tallas = Talla.objects.values_list('nombre', flat=True)
            invalid_tallas = [t for t in tallas_list if t not in existing_tallas]
            if invalid_tallas:
                results["errors"].append(f"Fila {index + 2}: Tallas inválidas: {', '.join(invalid_tallas)}")
                continue

            # Crear o actualizar producto
            producto, created = Producto.objects.update_or_create(
                sku=sku,
                defaults={
                    'nombre': nombre,
                    'precio_base': precio_base,
                    'categoria': categoria,
                    'genero': genero,
                    'temporada': temporada,
                    'marca': marca
                }
            )

            # Actualizar o crear tallas/stocks
            ProductoTallaStock.objects.filter(producto=producto).delete()  # Limpiar tallas antiguas
            for talla_nombre, stock in zip(tallas_list, stocks_int):
                talla = Talla.objects.get(nombre=talla_nombre)
                ProductoTallaStock.objects.create(producto=producto, talla=talla, stock=stock)

            if created:
                results["created"] += 1
            else:
                results["updated"] += 1

        return Response(results, status=status.HTTP_200_OK)


def inicio(request):
    productos_disponibles = Producto.objects.all()
    categorias_disponibles = Categoria.objects.all()
    marcas_disponibles = Marca.objects.all()
    generos_disponibles = Genero.objects.all()
    temporadas_disponibles = Temporada.objects.all()
    tallas_disponibles = Talla.objects.all()



    contexto = {
        'productos': productos_disponibles,
        'categorias': categorias_disponibles,
        'marcas': marcas_disponibles,
        'generos': generos_disponibles,
        'temporadas': temporadas_disponibles,
        'tallas': tallas_disponibles,
    }
    return render(request, 'admin/admin.html', contexto)
