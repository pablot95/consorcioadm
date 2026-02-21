<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$targetDir = "../uploads/properties/";
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if (!isset($_FILES['image'])) {
    echo json_encode(["success" => false, "error" => "No se recibió ninguna imagen."]);
    exit;
}

$file = $_FILES['image'];
$originalName = basename($file['name']);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowed = ['jpg','jpeg','png','gif','webp','avif'];

if (!in_array($ext, $allowed)) {
    echo json_encode(["success" => false, "error" => "Tipo de archivo no permitido: .$ext"]);
    exit;
}

$uniqueName = uniqid("prop_") . "." . $ext;
$targetPath = $targetDir . $uniqueName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $basePath = dirname(dirname($_SERVER['SCRIPT_NAME']));
    $publicUrl = $protocol . "://" . $host . $basePath . "/uploads/properties/" . $uniqueName;

    echo json_encode([
        "success" => true,
        "url" => $publicUrl,
        "filename" => $uniqueName
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Error al mover el archivo."]);
}
?>
