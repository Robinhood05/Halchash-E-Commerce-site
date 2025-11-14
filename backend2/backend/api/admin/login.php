<?php
session_start();
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$username = sanitizeInput($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    sendJSONResponse(['success' => false, 'error' => 'Username and password are required']);
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password'])) {
        // Set session
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_role'] = $admin['role'];
        
        // Remove password from response
        unset($admin['password']);
        sendJSONResponse([
            'success' => true,
            'admin' => $admin,
            'message' => 'Login successful'
        ]);
    } else {
        sendJSONResponse(['success' => false, 'error' => 'Invalid credentials'], 401);
    }
} catch (PDOException $e) {
    error_log("Admin login error: " . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Login failed'], 500);
}

?>

