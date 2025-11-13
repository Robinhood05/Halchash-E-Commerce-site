<?php
/**
 * Password Reset Helper Script
 * Use this to reset passwords for users who can't login
 * 
 * Usage: 
 * 1. Access via: http://localhost/halchash/backend/api/auth/password_reset_helper.php?email=user@example.com&new_password=newpass123
 * 2. Or use POST method with JSON body
 * 
 * SECURITY: Delete this file after use or restrict access!
 */

require_once '../../config/database.php';

header('Content-Type: application/json');

// Only allow in development/localhost
$allowedHosts = ['localhost', '127.0.0.1'];
$currentHost = $_SERVER['HTTP_HOST'] ?? '';
$isLocal = false;
foreach ($allowedHosts as $host) {
    if (strpos($currentHost, $host) !== false) {
        $isLocal = true;
        break;
    }
}

if (!$isLocal) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'This script is only available in local development']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = $_GET['email'] ?? '';
    $newPassword = $_GET['new_password'] ?? '';
} else {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $newPassword = $data['new_password'] ?? '';
}

if (empty($email) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Email and new_password are required',
        'usage' => 'GET: ?email=user@example.com&new_password=newpass123'
    ]);
    exit;
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Find user by email (case-insensitive)
    $emailLower = strtolower(trim($email));
    $stmt = $pdo->prepare("SELECT id, email FROM users WHERE LOWER(email) = ? LIMIT 1");
    $stmt->execute([$emailLower]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }
    
    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password
    $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateStmt->execute([$hashedPassword, $user['id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password reset successfully',
        'user_id' => $user['id'],
        'email' => $user['email']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>

