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