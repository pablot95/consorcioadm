<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Verificar que se enviaron archivos
if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se enviaron imágenes']);
    exit();
}

// Configuración
$uploadDir = '../uploads/properties/';
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$maxFileSize = 5 * 1024 * 1024; // 5MB por imagen
$uploadedUrls = [];

// Crear directorio si no existe
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Procesar cada imagen
$files = $_FILES['images'];
$fileCount = count($files['name']);

for ($i = 0; $i < $fileCount; $i++) {
    // Verificar errores
    if ($files['error'][$i] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Error al subir imagen ' . ($i + 1)]);
        exit();
    }

    // Verificar tipo de archivo
    $fileType = $files['type'][$i];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de archivo no permitido. Solo JPG, PNG y WebP']);
        exit();
    }

    // Verificar tamaño
    if ($files['size'][$i] > $maxFileSize) {
        http_response_code(400);
        echo json_encode(['error' => 'La imagen ' . ($i + 1) . ' supera el tamaño máximo de 5MB']);
        exit();
    }

    // Generar nombre único
    $extension = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
    $filename = uniqid('prop_' . time() . '_') . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Mover archivo
    if (move_uploaded_file($files['tmp_name'][$i], $filepath)) {
        // Guardar URL relativa (ajusta según tu dominio)
        $uploadedUrls[] = 'uploads/properties/' . $filename;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar imagen ' . ($i + 1)]);
        exit();
    }
}

// Responder con URLs
http_response_code(200);
echo json_encode([
    'success' => true,
    'urls' => $uploadedUrls
]);
?>
