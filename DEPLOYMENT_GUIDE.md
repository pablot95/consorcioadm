# Guía de Despliegue a SiteGround

## 📋 Resumen
Tu sitio web ahora usa:
- **Firebase Firestore**: Para almacenar datos de propiedades
- **SiteGround**: Para almacenar imágenes

## 📁 Estructura de Archivos

```
tu-dominio.com/
├── index.html
├── style.css
├── script.js
├── property-detail.html
├── admin/
│   ├── index.html
│   ├── admin-script.js
│   └── admin-style.css
├── images/
│   └── (logos y recursos estáticos)
├── api/
│   ├── upload-images.php      ← Nuevo: Sube imágenes
│   ├── delete-image.php        ← Nuevo: Elimina imágenes
│   └── .htaccess              ← Nuevo: Configuración PHP
└── uploads/
    └── properties/
        ├── .htaccess          ← Nuevo: Seguridad
        └── index.html         ← Nuevo: Prevenir listado
        └── (imágenes se guardarán aquí)
```

## 🚀 Pasos para Desplegar

### 1. Preparar Archivos Localmente
Asegúrate de que todos estos archivos estén en tu proyecto:
- ✅ api/upload-images.php
- ✅ api/delete-image.php
- ✅ api/.htaccess
- ✅ uploads/properties/.htaccess
- ✅ uploads/properties/index.html

### 2. Subir a SiteGround

**Opción A: Via File Manager (recomendado para principiantes)**
1. Ingresa al **cPanel** de SiteGround
2. Abre **File Manager**
3. Navega a `public_html` (o la carpeta de tu dominio)
4. Sube TODOS los archivos del proyecto manteniendo la estructura de carpetas
5. Asegúrate de que las carpetas `api/` y `uploads/` se crearon correctamente

**Opción B: Via FTP (recomendado para usuarios avanzados)**
1. Usa un cliente FTP como FileZilla
2. Conéctate con las credenciales de SiteGround
3. Sube todos los archivos a `public_html/`

### 3. Configurar Permisos
En el File Manager o via FTP, configura estos permisos:

```
uploads/               → 755 (rwxr-xr-x)
uploads/properties/    → 755 (rwxr-xr-x)
api/                   → 755 (rwxr-xr-x)
api/*.php              → 644 (rw-r--r--)
```

**Cómo cambiar permisos en cPanel:**
1. Click derecho en la carpeta/archivo
2. Selecciona "Change Permissions"
3. Ingresa el número (755 o 644)

### 4. Verificar PHP
SiteGround debe tener PHP 7.4+ activo. Para verificar:
1. Ve a **cPanel → PHP Manager** o **MultiPHP Manager**
2. Asegúrate de que tu sitio use PHP 7.4 o superior
3. Verifica que estas extensiones estén habilitadas:
   - ✅ fileinfo
   - ✅ gd (para procesamiento de imágenes)

### 5. Actualizar URL en admin-script.js (IMPORTANTE)
Si tu dominio es diferente a la carpeta local, actualiza la línea 19 en `admin/admin-script.js`:

```javascript
// Reemplaza esto si es necesario:
const SERVER_URL = 'https://tudominio.com'; // ← Tu dominio real
```

### 6. Probar el Sistema

**Prueba 1: Verificar que los archivos PHP funcionan**
Visita: `https://tudominio.com/api/upload-images.php`
- Deberías ver un error JSON (es normal si no envías imágenes)
- Si ves código PHP o error 404, los archivos no se subieron correctamente

**Prueba 2: Subir una propiedad con imagen**
1. Ve a `https://tudominio.com/admin/`
2. Inicia sesión
3. Crea una nueva propiedad
4. Sube 2-3 imágenes
5. Guarda la propiedad
6. Verifica que las imágenes aparezcan en el listado y en el sitio público

**Prueba 3: Verificar que las imágenes se guardaron**
En File Manager, verifica que en `uploads/properties/` aparezcan archivos como:
- `prop_1738876543_abc123.jpg`
- `prop_1738876544_def456.png`

## ⚠️ Solución de Problemas

### Error: "No se pueden subir imágenes"
**Solución 1: Permisos**
```bash
chmod 755 uploads/properties/
chmod 755 api/
```

**Solución 2: Límite de tamaño**
Edita `api/.htaccess` y aumenta los límites:
```apache
php_value upload_max_filesize 20M
php_value post_max_size 100M
```

### Error: "CORS policy"
Agrega al inicio de `api/upload-images.php`:
```php
header('Access-Control-Allow-Origin: https://tudominio.com');
```

### Error: Las imágenes no se muestran
Verifica que las URLs en Firestore sean completas:
- ✅ Correcto: `https://tudominio.com/uploads/properties/imagen.jpg`
- ❌ Incorrecto: `uploads/properties/imagen.jpg`

## 🔒 Seguridad

### Protección ya incluida:
- ✅ `.htaccess` previene ejecución de scripts en `/uploads/`
- ✅ Validación de tipos de archivo (solo imágenes)
- ✅ Validación de tamaño máximo (5MB por imagen)
- ✅ Nombres únicos para prevenir sobrescritura

### Recomendaciones adicionales:
1. **Cambia las credenciales de admin** en `admin-script.js` línea 30-32
2. **Protege la carpeta /admin/** con autenticación HTTP:
   ```apache
   # En admin/.htaccess
   AuthType Basic
   AuthName "Área Restringida"
   AuthUserFile /ruta/completa/.htpasswd
   Require valid-user
   ```

## 📊 Migración de Imágenes Existentes

Si ya tienes propiedades con imágenes en Firebase Storage:

1. **Descarga todas las imágenes** de Firebase Storage
2. **Súbelas manualmente** a `/uploads/properties/`
3. **Actualiza Firestore** con las nuevas URLs usando el panel de admin (edita cada propiedad y vuelve a subir las imágenes)

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa los logs de error de PHP en cPanel → Error Log
2. Usa la consola del navegador (F12) para ver errores JavaScript
3. Verifica que Firebase Firestore aún funcione correctamente

## ✅ Checklist Final

Antes de ir a producción, verifica:
- [ ] Todos los archivos subidos a SiteGround
- [ ] Permisos correctos (755 en carpetas, 644 en archivos)
- [ ] PHP 7.4+ activo
- [ ] URL del servidor actualizada en admin-script.js
- [ ] Prueba de subida de imagen exitosa
- [ ] Prueba de edición de propiedad existente
- [ ] Prueba de eliminación de propiedad
- [ ] Verificar que imágenes aparecen en el sitio público
- [ ] Credenciales de admin cambiadas
- [ ] Backup de Firebase creado

---

**¡Listo! Tu sitio está usando SiteGround para imágenes y Firebase para datos.** 🎉
