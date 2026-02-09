<?php
// Asegurar buffer de salida para limpiar cualquier caracter basura previo
ob_start();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

// Manejo de Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

$targetDir = '../uploads/properties/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadedUrls = [];
    $errors = [];

    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $files = $_FILES['images'];
        $count = count($files['name']);

        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
                $name = time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
                $target = $targetDir . $name;
                
                if (move_uploaded_file($files['tmp_name'][$i], $target)) {
                    $uploadedUrls[] = 'uploads/properties/' . $name;
                } else {
                    $errors[] = "Error moviendo el archivo " . $files['name'][$i];
                }
            } else {
                $errors[] = "Error de subida PHP: " . $files['error'][$i];
            }
        }
    } else {
        $errors[] = "No se recibieron archivos";
    }

    // Limpiar buffer y enviar JSON limpio
    ob_end_clean();
    
    if (!empty($uploadedUrls)) {
        echo json_encode(['success' => true, 'urls' => $uploadedUrls]);
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'No se pudieron subir imagenes', 'details' => $errors]);
    }
} else {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
?>