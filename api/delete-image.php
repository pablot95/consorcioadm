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

// Obtener datos JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['imageUrl']) || empty($data['imageUrl'])) {
    http_response_code(400);
    echo json_encode(['error' => 'URL de imagen no proporcionada']);
    exit();
}

$imageUrl = $data['imageUrl'];

// Extraer el path del archivo (solo si es del servidor)
if (strpos($imageUrl, 'uploads/properties/') !== false) {
    // Construir path completo
    $filename = basename($imageUrl);
    $filepath = '../uploads/properties/' . $filename;

    // Verificar que el archivo existe
    if (file_exists($filepath)) {
        // Eliminar archivo
        if (unlink($filepath)) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Imagen eliminada correctamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar el archivo']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Archivo no encontrado']);
    }
} else {
    // No es una imagen del servidor, no hacer nada (puede ser URL externa o antigua de Firebase)
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'URL externa, no se eliminó del servidor'
    ]);
}
?>
