from django.shortcuts import render
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto, Categoria, Genero, Temporada, Marca, ProductoTallaStock, Talla
from .serializers import ProductoWriteSerializer # <-- ¡Correcto!
from django.contrib.auth.decorators import login_required, user_passes_test
import io
from django.db import transaction

class ProductExportView(APIView):
    def get(self, request):
        # 👇 LA CORRECCIÓN ESTÁ AQUÍ.
        # Añadimos prefetch_related para cargar todos los stocks y tallas en solo 2 consultas adicionales.
        productos = Producto.objects.select_related('categoria', 'genero', 'temporada', 'marca').prefetch_related('talla_stock__talla').all()
        data = []

        for producto in productos:
            # Ahora esto no hace una nueva consulta a la BD, usa los datos ya cargados.
            talla_stocks = producto.talla_stock.all()
            tallas_str = ', '.join([ts.talla.nombre for ts in talla_stocks])
            stocks_str = ', '.join([str(ts.stock) for ts in talla_stocks])

            producto_data = {
                'SKU': producto.sku,
                'Nombre': producto.nombre,
                'Descripcion': producto.descripcion,
                'Precio Base': producto.precio_base,
                'En Oferta': 'Sí' if producto.en_oferta else 'No',
                'Descuento Porcentaje': producto.descuento_porcentaje,
                'Nombre Categoria': producto.categoria.nombre if producto.categoria else '',
                'Nombre Genero': producto.genero.nombre if producto.genero else '',
                'Nombre Temporada': producto.temporada.nombre if producto.temporada else '',
                'Nombre Marca': producto.marca.nombre if producto.marca else '',
                'Tallas': tallas_str,
                'Stocks': stocks_str
            }
            data.append(producto_data)

        df = pd.DataFrame(data)
        
        output = io.BytesIO()
        df.to_excel(output, index=False, engine='openpyxl')
        output.seek(0)

        response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="productos_exportados.xlsx"'
        return response

# --- El resto de tu código ya era correcto y robusto ---

class ProductImportView(APIView):
    def post(self, request):
        if 'excel_file' not in request.FILES:
            return Response({"error": "No se subió ningún archivo Excel"}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['excel_file']
        try:
            df = pd.read_excel(excel_file)
        except Exception as e:
            return Response({"error": f"Error al leer el archivo Excel: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = ['SKU', 'Nombre', 'Precio Base', 'Tallas', 'Stocks', 'Nombre Categoria', 'Nombre Genero', 'Nombre Temporada', 'Nombre Marca']
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            return Response({"error": f"Faltan las siguientes columnas requeridas: {', '.join(missing_cols)}"}, status=status.HTTP_400_BAD_REQUEST)

        results = {"created": 0, "updated": 0, "errors": []}
        
        try:
            with transaction.atomic():
                for index, row in df.iterrows():
                    sku = str(row.get('SKU', '')).strip()
                    if not sku:
                        results["errors"].append(f"Fila {index + 2}: El SKU es obligatorio.")
                        continue

                    tallas_str = str(row.get('Tallas', '')).strip()
                    stocks_str = str(row.get('Stocks', '')).strip()
                    
                    tallas_list = [t.strip() for t in tallas_str.split(',') if t.strip()]
                    stocks_list = [s.strip() for s in stocks_str.split(',') if s.strip()]

                    if len(tallas_list) != len(stocks_list):
                        results["errors"].append(f"Fila {index + 2}: El número de tallas ({len(tallas_list)}) no coincide con el de stocks ({len(stocks_list)}) para el SKU {sku}.")
                        continue
                    
                    try:
                        stocks_int = [int(stock) for stock in stocks_list]
                        if any(stock < 0 for stock in stocks_int):
                            raise ValueError("Stocks negativos")
                    except ValueError:
                        results["errors"].append(f"Fila {index + 2}: Los Stocks deben ser números enteros positivos para el SKU {sku}.")
                        continue

                    try:
                        categoria = Categoria.objects.get(nombre__iexact=str(row.get('Nombre Categoria', '')).strip())
                        genero = Genero.objects.get(nombre__iexact=str(row.get('Nombre Genero', '')).strip())
                        temporada = Temporada.objects.get(nombre__iexact=str(row.get('Nombre Temporada', '')).strip())
                        marca = Marca.objects.get(nombre__iexact=str(row.get('Nombre Marca', '')).strip())
                    except (Categoria.DoesNotExist, Genero.DoesNotExist, Temporada.DoesNotExist, Marca.DoesNotExist) as e:
                        results["errors"].append(f"Fila {index + 2}: No se encontró un valor para '{e.model.__name__}' con el nombre proporcionado para el SKU {sku}.")
                        continue
                    
                    existing_tallas = Talla.objects.values_list('nombre', flat=True)
                    invalid_tallas = [t for t in tallas_list if t not in existing_tallas]
                    if invalid_tallas:
                        results["errors"].append(f"Fila {index + 2}: Tallas inválidas: {', '.join(invalid_tallas)} para el SKU {sku}.")
                        continue

                    producto, created = Producto.objects.update_or_create(
                        sku=sku,
                        defaults={
                            'nombre': str(row.get('Nombre', '')).strip(),
                            'precio_base': float(row.get('Precio Base', 0.0)),
                            'descripcion': str(row.get('Descripcion', '')).strip(),
                            'categoria': categoria,
                            'genero': genero,
                            'temporada': temporada,
                            'marca': marca
                        }
                    )

                    ProductoTallaStock.objects.filter(producto=producto).delete()
                    for talla_nombre, stock in zip(tallas_list, stocks_int):
                        talla = Talla.objects.get(nombre=talla_nombre)
                        ProductoTallaStock.objects.create(producto=producto, talla=talla, stock=stock)

                    if created:
                        results["created"] += 1
                    else:
                        results["updated"] += 1
                
                if results["errors"]:
                    raise ValueError("Se encontraron errores de validación en el archivo.")

        except ValueError:
            return Response(results, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            results["errors"].append(f"Ocurrió un error inesperado en el servidor: {str(e)}")
            return Response(results, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        return Response(results, status=status.HTTP_200_OK)

def es_superusuario(user):
    return user.is_superuser

@login_required
@user_passes_test(es_superusuario)
def administrador(request):
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

# --- 👇👇 AQUÍ ESTÁ LA NUEVA VISTA AÑADIDA 👇👇 ---

@login_required
@user_passes_test(es_superusuario)
def gestion_atributos(request):
    # Obtenemos todos los datos de la base de datos
    categorias = Categoria.objects.all()
    marcas = Marca.objects.all()
    tallas = Talla.objects.all()
    generos = Genero.objects.all()
    temporadas = Temporada.objects.all()

    # Los empaquetamos en un "contexto" para enviarlos al HTML
    contexto = {
        'categorias': categorias,
        'marcas': marcas,
        'tallas': tallas,
        'generos': generos,
        'temporadas': temporadas,
    }
    # Renderizamos el nuevo archivo HTML que vamos a crear
    return render(request, 'admin/gestion_atributos.html', contexto)