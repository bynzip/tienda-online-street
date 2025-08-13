# app_street/forms.py
from django import forms
from .models import Producto

class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = [
            'nombre', 'precio', 'descripcion', 'stock',
            'color', 'talla', 'categoria', 'genero',
            'temporada', 'marca'
        ]
        widgets = {
            'descripcion': forms.Textarea(attrs={'class': 'textarea'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name in ['nombre', 'precio', 'stock', 'color', 'talla']:
            self.fields[field_name].widget.attrs.update({'class': 'input'})

        self.fields['categoria'].empty_label = "Selecciona una categoría"
        self.fields['genero'].empty_label = "Selecciona un género"
        self.fields['temporada'].empty_label = "Selecciona una temporada"
        self.fields['marca'].empty_label = "Selecciona una marca"

        for field_name in ['categoria', 'genero', 'temporada', 'marca']:
            self.fields[field_name].widget.attrs.update({'class': 'select'})

        # Opcional: Filtrar solo marcas deportivas específicas si existen
        # marcas_deportivas = ['Adidas', 'Nike', 'Puma', 'Reebok', 'Under Armour']
        # self.fields['marca'].queryset = self.fields['marca'].queryset.filter(nombre__in=marcas_deportivas)