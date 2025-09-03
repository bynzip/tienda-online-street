<<<<<<< HEAD
import io
import pandas as pd
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import messages
from .models import Producto, Categoria, Genero, Temporada, Marca, ImagenProducto
from .forms import ProductoForm
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def inicio(request):
    """Vista principal: formulario para agregar, import/export"""
    categorias = Categoria.objects.all()
    generos = Genero.objects.all()
    temporadas = Temporada.objects.all()
    marcas = Marca.objects.all()

    if request.method == "POST" and request.POST.get("form_type") == "add_product":
        form = ProductoForm(request.POST)
        if form.is_valid():
            producto = form.save()
            # manejo de imágenes subidas con validación
            files = request.FILES.getlist('imagenes')
            for f in files:
                # Validar tipo de archivo
                if not f.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    messages.warning(request, f"Archivo {f.name} no es una imagen válida.")
                    continue
                
                # Validar tamaño (máximo 5MB)
                if f.size > 5 * 1024 * 1024:
                    messages.warning(request, f"Archivo {f.name} es demasiado grande (máximo 5MB).")
                    continue
                
                # guardar archivo en MEDIA y registrar URL en ImagenProducto
                path = default_storage.save('productos/' + f.name, ContentFile(f.read()))
                url = default_storage.url(path)
                ImagenProducto.objects.create(producto=producto, url_imagen=url)
            messages.success(request, "Producto agregado correctamente.")
            return redirect('inicio')
        else:
            messages.error(request, "Corrige los campos del formulario.")
    else:
        form = ProductoForm()

    context = {
        'form': form,
        'categorias': categorias,
        'generos': generos,
        'temporadas': temporadas,
        'marcas': marcas,
    }
    return render(request, 'agregar_producto_moderno.html', context)


def importar_productos_excel(request):
    """Importa desde un .xlsx y crea los registros relacionados"""
    if request.method == "POST" and request.FILES.get("archivo_excel"):
        file = request.FILES["archivo_excel"]
        try:
            df = pd.read_excel(file)
        except Exception as e:
            messages.error(request, f"Error leyendo Excel: {e}")
            return redirect('inicio')

        required_cols = {"Nombre","Descripcion","Precio","Stock","Color","Talla","Categoria","Genero","Temporada","Marca"}
        if not required_cols.issubset(set(df.columns)):
            messages.error(request, "El archivo Excel debe contener las columnas: " + ", ".join(sorted(required_cols)))
            return redirect('inicio')

        created = 0
        for _, row in df.iterrows():
            try:
                categoria, _ = Categoria.objects.get_or_create(nombre=str(row["Categoria"]).strip())
                genero, _ = Genero.objects.get_or_create(nombre=str(row["Genero"]).strip())
                temporada, _ = Temporada.objects.get_or_create(nombre=str(row["Temporada"]).strip())
                marca, _ = Marca.objects.get_or_create(nombre=str(row["Marca"]).strip())

                # Validar y convertir datos con manejo de errores
                try:
                    precio = float(row["Precio"]) if not pd.isna(row["Precio"]) else 0.01
                    stock = int(row["Stock"]) if not pd.isna(row["Stock"]) else 0
                    
                    if precio <= 0:
                        precio = 0.01
                    if stock < 0:
                        stock = 0
                        
                except (ValueError, TypeError):
                    continue  # Saltar fila con datos inválidos
                
                producto = Producto.objects.create(
                    nombre=str(row["Nombre"]).strip(),
                    descripcion=str(row.get("Descripcion", "")).strip(),
                    precio=precio,
                    stock=stock,
                    color=str(row.get("Color", "")).strip(),
                    talla=str(row.get("Talla", "")).strip(),
                    categoria=categoria,
                    genero=genero,
                    temporada=temporada,
                    marca=marca
                )
                created += 1
            except Exception as e:
                # puedes registrar fallos en un log si lo deseas
                continue

        messages.success(request, f"Importación finalizada. Productos creados: {created}")
        return redirect('inicio')

    messages.error(request, "No se recibió archivo.")
    return redirect('inicio')


def exportar_productos_excel(request):
    """Exporta productos a Excel y devuelve descarga"""
    qs = Producto.objects.select_related("categoria","genero","temporada","marca").all()
    data = []
    for p in qs:
        data.append({
            "Nombre": p.nombre,
            "Descripcion": p.descripcion,
            "Precio": float(p.precio),
            "Stock": p.stock,
            "Color": p.color,
            "Talla": p.talla,
            "Categoria": p.categoria.nombre if p.categoria else "",
            "Genero": p.genero.nombre if p.genero else "",
            "Temporada": p.temporada.nombre if p.temporada else "",
            "Marca": p.marca.nombre if p.marca else "",
            "Fecha Registro": p.fecha_registro.strftime("%Y-%m-%d %H:%M"),
        })
    df = pd.DataFrame(data)

    # exportar a un Excel en memoria
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Productos')
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=productos_exportados.xlsx'
    return response
=======
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
>>>>>>> main
