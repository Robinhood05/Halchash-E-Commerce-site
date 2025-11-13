<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $userId = sanitizeInput($_POST['userId'] ?? '');

    if (empty($userId)) {
        sendJSONResponse(['success' => false, 'error' => 'User ID is required']);
    }

    if (!isset($_FILES['avatar'])) {
        sendJSONResponse(['success' => false, 'error' => 'No file uploaded']);
    }

    $file = $_FILES['avatar'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    // Validate file
    if ($file['size'] > $maxSize) {
        sendJSONResponse(['success' => false, 'error' => 'File size exceeds 5MB limit']);
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        sendJSONResponse(['success' => false, 'error' => 'Invalid file type. Only images are allowed']);
    }

    // Create upload directory
    $uploadDir = __DIR__ . '/../../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'avatar_' . $userId . '_' . time() . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        sendJSONResponse(['success' => false, 'error' => 'Failed to upload file']);
    }

    // Get base URL for avatar
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $avatarUrl = $protocol . '://' . $host . UPLOAD_BASE_PATH . '/avatars/' . $fileName;

    // Update user avatar in database
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$avatarUrl, $userId]);

    sendJSONResponse([
        'success' => true,
        'message' => 'Avatar uploaded successfully',
        'avatar' => $avatarUrl
    ]);
} catch (Exception $e) {
    error_log("Avatar upload error: " . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Avatar upload failed'], 500);
}
