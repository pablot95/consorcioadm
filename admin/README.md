# Panel Administrativo - Bastons Paulete

## 🔐 Acceso al Panel

URL: `admin/index.html`

## 📋 Funcionalidades

### Gestión de Propiedades
- ✅ Crear nuevas propiedades
- ✅ Editar propiedades existentes
- ✅ Eliminar propiedades
- ✅ Upload de múltiples imágenes
- ✅ Visualización de propiedades publicadas

### Campos de Propiedad
- Dirección
- Tipo (Departamento, Casa, Lote-Terreno, Oficina, Chacra, Galpón, Edificio)
- Operación (Venta/Alquiler)
- Región (General Roca / La Plata)
- Localidad (según región seleccionada)
- Precio
- Dormitorios, Baños
- Área cubierta, Terreno
- Coordenadas (Latitud/Longitud)
- Descripción
- Imágenes (múltiples, la primera es principal)
- Características y Servicios (11 opciones)

### Localidades Disponibles

**General Roca:**
- General Roca
- Ingeniero Huergo
- Regina
- General Godoy
- Cervantes
- Villa Regina

**La Plata:**
- La Plata
- Ensenada
- Berisso
- Gonnet
- Tolosa

## 🔥 Firebase Configuration

El panel está conectado a Firebase con:
- **Firestore**: Base de datos para propiedades
- **Storage**: Almacenamiento de imágenes
- **Authentication**: Login de administradores

## 📞 Números de WhatsApp

- **General Roca**: 221 428-3399
- **La Plata**: 221 576-6081

Cada propiedad muestra el número correcto según su región.

## 🚀 Primeros Pasos

1. Crear usuario en Firebase Authentication
2. Acceder al panel con email/contraseña
3. Comenzar a cargar propiedades

## 📝 Notas

- Las imágenes se suben a Firebase Storage
- Solo se muestran características activas en las propiedades
- El sistema detecta automáticamente la región para el WhatsApp correcto
