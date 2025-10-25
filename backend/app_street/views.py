from django.shortcuts import render
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Asegúrate de importar todos los modelos necesarios
from .models import (
    Producto, Categoria, Genero, Temporada, Marca, ProductoTallaStock, Talla
)
# Usa el serializer correcto si es necesario (aunque no lo uses directamente aquí)
# from .serializers import ProductoWriteSerializer # Comentado si no se usa directamente
from django.contrib.auth.decorators import login_required, user_passes_test
import io
from django.db import transaction, IntegrityError
from decimal import Decimal, InvalidOperation # Asegúrate de importar Decimal


class ProductExportView(APIView):
    # Sin cambios en ExportView...
    def get(self, request):
        productos = Producto.objects.select_related(
            'categoria', 'genero', 'temporada', 'marca'
        ).prefetch_related('talla_stock__talla').all()
        data = []

        for producto in productos:
            # El prefetch_related hace que esto sea eficiente
            talla_stocks = producto.talla_stock.all()
            tallas_str = ', '.join([ts.talla.nombre for ts in talla_stocks])
            stocks_str = ', '.join([str(ts.stock) for ts in talla_stocks])

            producto_data = {
                'SKU': producto.sku,
                'Nombre': producto.nombre,
                'Descripcion': producto.descripcion,
                # Formatear Decimal a string para Excel si es necesario
                'Precio Base': str(producto.precio_base.quantize(Decimal("0.01"))),
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
        # Usar xlsxwriter o openpyxl si necesitas más control o compatibilidad
        df.to_excel(output, index=False, engine='openpyxl')
        output.seek(0)

        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="productos_exportados.xlsx"'
        return response


class ProductImportView(APIView):
    def post(self, request):
        if 'excel_file' not in request.FILES:
            return Response({"error": "No se subió ningún archivo Excel"}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['excel_file']
        try:
            # Leer todo como string para evitar problemas con tipos y NaN
            df = pd.read_excel(excel_file, dtype=str).fillna('')
        except Exception as e:
            # Ser más específico con el error puede ayudar
            return Response({"error": f"Error al leer el archivo Excel. Asegúrate que sea un .xlsx o .xls válido. Detalle: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        required_columns = ['SKU', 'Nombre', 'Precio Base', 'Tallas', 'Stocks',
                            'Nombre Categoria', 'Nombre Genero', 'Nombre Temporada', 'Nombre Marca',
                            'En Oferta', 'Descuento Porcentaje']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return Response({"error": f"Faltan las siguientes columnas requeridas: {', '.join(missing_cols)}"}, status=status.HTTP_400_BAD_REQUEST)

        results = {"created": 0, "updated": 0, "errors": []}
        row_number = 2 # Excel row numbers start typically at 1, header is 1, data starts at 2

        try:
            with transaction.atomic():
                 # Optimización: Cargar objetos relacionados en memoria una sola vez
                todas_las_tallas = {t.nombre: t for t in Talla.objects.all()}
                todas_las_categorias = {c.nombre.lower(): c for c in Categoria.objects.all()}
                todos_los_generos = {g.nombre.lower(): g for g in Genero.objects.all()}
                todas_las_temporadas = {t.nombre.lower(): t for t in Temporada.objects.all()}
                todas_las_marcas = {m.nombre.lower(): m for m in Marca.objects.all()}

                for index, row in df.iterrows():
                    current_row_number = row_number + index
                    sku = str(row.get('SKU', '')).strip()
                    if not sku:
                        results["errors"].append(f"Fila {current_row_number}: El SKU es obligatorio.")
                        continue # Saltar esta fila

                    # --- Validación y obtención de datos de la fila ---
                    try:
                        precio_base_str = str(row.get('Precio Base', '0.00')).strip()
                        precio_base_excel = Decimal(precio_base_str) if precio_base_str else Decimal('0.00')
                        if precio_base_excel < Decimal(0):
                             raise ValueError("Precio negativo")
                    except (InvalidOperation, ValueError):
                         results["errors"].append(f"Fila {current_row_number}: 'Precio Base' ('{precio_base_str}') debe ser un número decimal válido y no negativo para el SKU {sku}.")
                         continue

                    en_oferta_excel = str(row.get('En Oferta', '')).strip().lower() in ['sí', 'si', 'true', '1'] # Más flexible

                    descuento_str = str(row.get('Descuento Porcentaje', '0')).strip()
                    try:
                        # Permitir vacío o 0
                        descuento_excel = int(descuento_str) if descuento_str else 0
                        if not (0 <= descuento_excel <= 100):
                            raise ValueError("Descuento fuera de rango [0-100]")
                    except ValueError:
                         results["errors"].append(f"Fila {current_row_number}: 'Descuento Porcentaje' ('{descuento_str}') debe ser un número entero entre 0 y 100 para el SKU {sku}.")
                         continue

                    # --- Validación de Tallas y Stocks ---
                    tallas_str = str(row.get('Tallas', '')).strip()
                    stocks_str = str(row.get('Stocks', '')).strip()
                    # Permitir comas o espacios como separadores y limpiar
                    tallas_list = [t.strip() for t in tallas_str.replace(' ', ',').split(',') if t.strip()]
                    stocks_list = [s.strip() for s in stocks_str.replace(' ', ',').split(',') if s.strip()]


                    if len(tallas_list) != len(stocks_list):
                        results["errors"].append(f"Fila {current_row_number}: El número de tallas ({len(tallas_list)}) no coincide con el de stocks ({len(stocks_list)}) para el SKU {sku}.")
                        continue
                    try:
                        stocks_int = [int(stock) for stock in stocks_list]
                        if any(stock < 0 for stock in stocks_int):
                            raise ValueError("Stocks negativos no permitidos")
                    except ValueError:
                        results["errors"].append(f"Fila {current_row_number}: Los Stocks ('{stocks_str}') deben ser números enteros positivos para el SKU {sku}.")
                        continue

                    # --- Búsqueda y validación de relaciones y tallas (usando datos precargados) ---
                    categoria, genero, temporada, marca = None, None, None, None # Reset for each row
                    related_errors = []

                    categoria_nombre = str(row.get('Nombre Categoria', '')).strip().lower()
                    if categoria_nombre and categoria_nombre not in todas_las_categorias:
                         related_errors.append(f"Categoría '{row.get('Nombre Categoria', '')}'")
                    elif categoria_nombre:
                         categoria = todas_las_categorias[categoria_nombre]

                    genero_nombre = str(row.get('Nombre Genero', '')).strip().lower()
                    if genero_nombre and genero_nombre not in todos_los_generos:
                        related_errors.append(f"Género '{row.get('Nombre Genero', '')}'")
                    elif genero_nombre:
                        genero = todos_los_generos[genero_nombre]

                    temporada_nombre = str(row.get('Nombre Temporada', '')).strip().lower()
                    if temporada_nombre and temporada_nombre not in todas_las_temporadas:
                         related_errors.append(f"Temporada '{row.get('Nombre Temporada', '')}'")
                    elif temporada_nombre:
                        temporada = todas_las_temporadas[temporada_nombre]

                    marca_nombre = str(row.get('Nombre Marca', '')).strip().lower()
                    if marca_nombre and marca_nombre not in todas_las_marcas:
                         related_errors.append(f"Marca '{row.get('Nombre Marca', '')}'")
                    elif marca_nombre:
                        marca = todas_las_marcas[marca_nombre]

                    talla_objs_map = {} # Mapa nombre_talla -> objeto_talla para esta fila
                    invalid_tallas = []
                    for t_nombre in tallas_list:
                        if t_nombre not in todas_las_tallas:
                            invalid_tallas.append(t_nombre)
                        else:
                            talla_objs_map[t_nombre] = todas_las_tallas[t_nombre] # Guardar objeto talla válido

                    if invalid_tallas:
                         related_errors.append(f"Tallas inválidas: {', '.join(invalid_tallas)}")

                    if related_errors:
                        results["errors"].append(f"Fila {current_row_number} (SKU: {sku}): No se encontraron o son inválidos los siguientes valores: {'; '.join(related_errors)}.")
                        continue # Saltar esta fila

                    # --- Crear o actualizar el producto ---
                    producto_defaults = {
                        'nombre': str(row.get('Nombre', '')).strip(),
                        'precio_base': precio_base_excel,
                        'descripcion': str(row.get('Descripcion', '')).strip(),
                        'categoria': categoria,
                        'genero': genero,
                        'temporada': temporada,
                        'marca': marca,
                        'en_oferta': en_oferta_excel,
                        'descuento_porcentaje': descuento_excel
                    }
                    # No es necesario limpiar None aquí si las búsquedas anteriores ya lo manejaron

                    try:
                        producto, created = Producto.objects.update_or_create(
                            sku=sku,
                            defaults=producto_defaults
                        )
                    except IntegrityError as ie: # Capturar error si SKU ya existe pero con diferente case, etc.
                         results["errors"].append(f"Fila {current_row_number}: Error de integridad al guardar SKU {sku}. ¿Duplicado? Detalle: {str(ie)}")
                         continue # Saltar esta fila
                    except Exception as e: # Capturar otros errores inesperados al guardar
                         results["errors"].append(f"Fila {current_row_number}: Error inesperado al guardar producto SKU {sku}. Detalle: {str(e)}")
                         continue # Saltar esta fila


                    # --- Actualizar/Crear Stock ---
                    # Eliminar stock antiguo para este producto
                    ProductoTallaStock.objects.filter(producto=producto).delete()
                    # Crear nuevo stock usando bulk_create
                    stock_bulk_list = []
                    for talla_nombre, stock_val in zip(tallas_list, stocks_int):
                        talla_obj = talla_objs_map[talla_nombre] # Obtener el objeto Talla ya validado
                        stock_bulk_list.append(
                            ProductoTallaStock(producto=producto, talla=talla_obj, stock=stock_val)
                        )
                    if stock_bulk_list:
                         ProductoTallaStock.objects.bulk_create(stock_bulk_list)


                    # Contar creación o actualización
                    if created:
                        results["created"] += 1
                    else:
                        results["updated"] += 1

                # FIN DEL BUCLE FOR

                # Si hubo errores durante el bucle, lanzar excepción para revertir la transacción
                if results["errors"]:
                    # Formatear errores para mejor lectura
                    error_message = f"Se encontraron {len(results['errors'])} errores durante la importación:\n" + "\n".join(results["errors"])
                    raise ValueError(error_message) # Esto causa el rollback

        # Captura específica del ValueError que lanzamos para errores de validación
        except ValueError as ve:
            # El mensaje de error ya está formateado en `ve`
             # No añadirlo de nuevo a results["errors"], solo devolverlo
            return Response({"created": results["created"], "updated": results["updated"], "errors": str(ve).split('\n')}, status=status.HTTP_400_BAD_REQUEST)

        # Captura de otros errores inesperados
        except Exception as e:
            # Loguear el error completo en el servidor podría ser útil aquí
            # logger.error(f"Error inesperado en importación Excel: {str(e)}", exc_info=True)
            results["errors"].append(f"Ocurrió un error inesperado en el servidor durante la transacción: {str(e)}")
            return Response(results, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Si todo fue bien (no se lanzó excepción)
        return Response(results, status=status.HTTP_200_OK)


# --- Vistas de Administración (sin cambios) ---
def es_superusuario(user):
    # Considerar usar permissions.IsAdminUser en lugar de esto si usas DRF para estas vistas también
    return user.is_authenticated and user.is_superuser

@login_required # Redirige a LOGIN_URL si no está autenticado
@user_passes_test(es_superusuario) # Verifica que sea superusuario
def administrador(request):
    # Ya no necesitamos pasar todos los productos aquí si la tabla se carga por JS/API
    categorias_disponibles = Categoria.objects.all()
    marcas_disponibles = Marca.objects.all()
    generos_disponibles = Genero.objects.all()
    temporadas_disponibles = Temporada.objects.all()
    tallas_disponibles = Talla.objects.all() # Necesario para los selects del form

    contexto = {
        # 'productos': productos_disponibles, # Quitado si la tabla es dinámica
        'categorias': categorias_disponibles,
        'marcas': marcas_disponibles,
        'generos': generos_disponibles,
        'temporadas': temporadas_disponibles,
        'tallas': tallas_disponibles, # Podría quitarse si los selects se llenan por API
    }
    return render(request, 'admin/admin.html', contexto)

@login_required
@user_passes_test(es_superusuario)
def gestion_atributos(request):
    contexto = {
        'categorias': Categoria.objects.all().order_by('nombre'), # Ordenar alfabéticamente
        'marcas': Marca.objects.all().order_by('nombre'),
        'tallas': Talla.objects.all().order_by('nombre'), # Considerar orden numérico/lógico si es necesario
        'generos': Genero.objects.all().order_by('nombre'),
        'temporadas': Temporada.objects.all().order_by('nombre'),
    }
    return render(request, 'admin/gestion_atributos.html', contexto)

