<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = sanitizeInput($data['userId'] ?? '');
    $name = sanitizeInput($data['name'] ?? '');
    $email = sanitizeInput($data['email'] ?? '');
    $phone = sanitizeInput($data['phone'] ?? '');
    $address = sanitizeInput($data['address'] ?? '');

    if (empty($userId)) {
        sendJSONResponse(['success' => false, 'error' => 'User ID is required']);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJSONResponse(['success' => false, 'error' => 'Invalid email format']);
    }

    $pdo = getDBConnection();

    // Check if email is already used by another user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        sendJSONResponse(['success' => false, 'error' => 'Email already in use']);
    }
    
    // Normalize phone: trim and set to NULL if empty
    $phone = !empty(trim($phone)) ? trim($phone) : null;
    
    // Check if phone number is already used by another user (only if phone is provided)
    if ($phone !== null) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ? AND id != ?");
        $stmt->execute([$phone, $userId]);
        if ($stmt->fetch()) {
            sendJSONResponse(['success' => false, 'error' => 'Phone number already in use']);
        }
    }

    // Update user
    $stmt = $pdo->prepare("
        UPDATE users 
        SET name = ?, email = ?, phone = ?, address = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$name, $email, $phone, $address, $userId]);

    // Get updated user
    $stmt = $pdo->prepare("SELECT id, name, email, phone, address, avatar, created_at, updated_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    sendJSONResponse([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
} catch (PDOException $e) {
    error_log("Profile update error: " . $e->getMessage());
    
    // Handle unique constraint violations
    $errorInfo = $e->errorInfo();
    $sqlState = $errorInfo[0] ?? '';
    $mysqlErrorCode = $errorInfo[1] ?? 0;
    $errorMsg = $e->getMessage();
    
    // Check for duplicate entry (SQLSTATE 23000 or MySQL error 1062)
    if ($sqlState == '23000' || $mysqlErrorCode == 1062 || strpos($errorMsg, 'Duplicate entry') !== false) {
        if (stripos($errorMsg, 'email') !== false || stripos($errorMsg, 'users.email') !== false) {
            sendJSONResponse(['success' => false, 'error' => 'Email already in use']);
        } elseif (stripos($errorMsg, 'phone') !== false || stripos($errorMsg, 'users.phone') !== false || stripos($errorMsg, 'unique_phone') !== false) {
            sendJSONResponse(['success' => false, 'error' => 'Phone number already in use']);
        } else {
            sendJSONResponse(['success' => false, 'error' => 'Profile update failed: Duplicate entry']);
        }
    } else {
        sendJSONResponse(['success' => false, 'error' => 'Profile update failed'], 500);
    }
} catch (Exception $e) {
    error_log("Unexpected error: " . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Unexpected error'], 500);
}
