<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['filename'])) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$filename = basename($input['filename']);
$uploadDir = realpath(__DIR__ . '/../uploads/properties/');
$filepath = $uploadDir . '/' . $filename;

if (!$uploadDir) {
    echo json_encode(['success' => false, 'error' => 'Directorio de uploads no encontrado']);
    exit;
}

$realFilePath = realpath($filepath);
if ($realFilePath === false || strpos($realFilePath, $uploadDir) !== 0) {
    echo json_encode(['success' => false, 'error' => 'Ruta de archivo inválida']);
    exit;
}

if (!file_exists($filepath)) {
    echo json_encode(['success' => false, 'error' => 'Archivo no encontrado: ' . $filename]);
    exit;
}

if (unlink($filepath)) {
    echo json_encode(['success' => true, 'message' => 'Imagen eliminada: ' . $filename]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se pudo eliminar el archivo']);
}
?>
