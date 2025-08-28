# Sistema de Gestión para Tienda Online Street

## 1. Resumen Ejecutivo

Este repositorio contiene el código fuente para el sistema de gestión de inventario de la "Tienda Online Street". El proyecto está siendo desarrollado en Python utilizando el framework Django, con el objetivo de crear una plataforma robusta y escalable para la administración de una tienda de comercio electrónico.

---

## 2. Propósito de la Rama Actual: API de Administración y Seguridad

El enfoque principal de esta fase de desarrollo es construir el **back-office** y la lógica de negocio fundamental. Los objetivos clave son:

1.  **Desarrollar una API RESTful:** Utilizando `Django REST Framework`, se crearán los *endpoints* necesarios para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las entidades principales del sistema: productos, categorías, marcas, etc.
2.  **Implementar Autenticación y Autorización:** Se establecerá un sistema de seguridad para proteger los *endpoints* de la API. Esto garantizará que solo los usuarios administradores, debidamente autenticados y con los permisos necesarios, puedan acceder y modificar los datos del inventario.

---

## 3. Arquitectura del Sistema

La aplicación está construida siguiendo las mejores prácticas y patrones de diseño del framework Django.

-   **Framework Backend:** Django 5.2.4
-   **Lenguaje:** Python 3.x
-   **API:** Django REST Framework
-   **Base de Datos:** Configurado para PostgreSQL a través del driver `psycopg2-binary`. La arquitectura de Django permite una fácil adaptación a otros sistemas de bases de datos (e.g., SQLite, MySQL).
-   **Dependencias Clave:**
    -   `pandas`: Utilizado para la manipulación de datos de alta performance durante los procesos de importación y exportación.
    -   `openpyxl`: Motor para la lectura y escritura de archivos en formato Excel (`.xlsx`).

---


## 5. Estructura del Proyecto

El código fuente está organizado siguiendo la estructura estándar de un proyecto Django.
```
tienda-online-street/
├── app_street/               # Aplicación principal del proyecto
│   ├── migrations/           # Archivos de migración de la base de datos
│   ├── static/               # Archivos estáticos (CSS, JS, imágenes)
│   ├── templates/            # Plantillas HTML (Vistas)
│   ├── admin.py              # Configuración del panel de administración de Django
│   ├── forms.py              # Definición de formularios de Django
│   ├── models.py             # Definición de los modelos de datos (ORM)
│   ├── urls.py               # Mapeo de URLs para la aplicación
│   └── views.py              # Lógica de negocio y controladores de vistas
├── tienda_online_street/     # Directorio de configuración del proyecto
│   ├── settings.py           # Configuración global del proyecto
│   └── urls.py               # Mapeo de URLs principal
├── manage.py                 # Utilidad de línea de comandos de Django
└── README.md                 # Este documento
```

---

## 6. Hoja de Ruta para Futuras Mejoras (Roadmap)

-   **[ ] Creación de un Front-end para Clientes:** Desarrollar la interfaz pública de la tienda online para que los clientes puedan navegar, buscar y comprar productos.
-   **[ ] Operaciones en Lote:** Implementar la importación y exportación masiva de productos mediante archivos Excel.
-   **[ ] Cobertura de Pruebas (Testing):** Desarrollar un conjunto de pruebas unitarias y de integración para asegurar la fiabilidad y mantenibilidad del código.
-   **[ ] Integración de Almacenamiento en la Nube:** Configurar el sistema para almacenar archivos multimedia (imágenes de productos) en un servicio de almacenamiento en la nube como AWS S3 o Google Cloud Storage, optimizando para escalabilidad y producción.
