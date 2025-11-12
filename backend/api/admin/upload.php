<?php
session_start();
require_once '../../config/cors.php';

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    sendJSONResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendJSONResponse(['success' => false, 'error' => 'No file uploaded or upload error']);
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validate file type
if (!in_array($file['type'], $allowedTypes)) {
    sendJSONResponse(['success' => false, 'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed']);
}

// Validate file size
if ($file['size'] > $maxSize) {
    sendJSONResponse(['success' => false, 'error' => 'File size exceeds 5MB limit']);
}

// Create upload directory if it doesn't exist
$uploadDir = '../../uploads/products/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'product_' . time() . '_' . uniqid() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    // Return relative path for database storage
    $relativePath = '/backend/uploads/products/' . $filename;
    sendJSONResponse([
        'success' => true,
        'image' => $relativePath,
        'message' => 'Image uploaded successfully'
    ]);
} else {
    sendJSONResponse(['success' => false, 'error' => 'Failed to upload file']);
}

?>

