<?php
session_start();
require_once '../../config/cors.php';
require_once '../../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    sendJSONResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();
$adminId = $_SESSION['admin_id'];

// Check if blocked_users table exists, if not return empty array
try {
    $pdo->query("SELECT 1 FROM blocked_users LIMIT 1");
} catch (PDOException $e) {
    // Table doesn't exist, return empty array
    if ($method === 'GET') {
        sendJSONResponse(['success' => true, 'blocked_users' => []]);
        exit;
    }
    // For other methods, return error
    sendJSONResponse(['success' => false, 'error' => 'Blocked users table does not exist. Please run the migration first.'], 500);
    exit;
}

switch ($method) {
    case 'GET':
        // Get all blocked users
        $stmt = $pdo->query('
            SELECT bu.*, a.username as blocked_by_username
            FROM blocked_users bu
            LEFT JOIN admins a ON bu.blocked_by = a.id
            ORDER BY bu.blocked_at DESC
        ');
        $blockedUsers = $stmt->fetchAll();
        sendJSONResponse(['success' => true, 'blocked_users' => $blockedUsers]);
        break;

    case 'POST':
        // Block a user by phone number
        $data = json_decode(file_get_contents('php://input'), true);
        $phone = trim($data['phone'] ?? '');
        $reason = trim($data['reason'] ?? '');

        if (empty($phone)) {
            sendJSONResponse(['success' => false, 'error' => 'Phone number is required'], 400);
        }

        // Normalize phone number (remove spaces, dashes, etc.)
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        try {
            $stmt = $pdo->prepare('INSERT INTO blocked_users (phone, reason, blocked_by) VALUES (?, ?, ?)');
            $stmt->execute([$phone, $reason, $adminId]);
            sendJSONResponse([
                'success' => true,
                'message' => 'User blocked successfully',
                'id' => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                sendJSONResponse(['success' => false, 'error' => 'This phone number is already blocked'], 400);
            } else {
                error_log('Block user error: ' . $e->getMessage());
                sendJSONResponse(['success' => false, 'error' => 'Failed to block user'], 500);
            }
        }
        break;

    case 'DELETE':
        // Unblock a user
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $phone = trim($data['phone'] ?? '');

        if ($id > 0) {
            $stmt = $pdo->prepare('DELETE FROM blocked_users WHERE id = ?');
            $stmt->execute([$id]);
        } elseif (!empty($phone)) {
            $phone = preg_replace('/[^0-9+]/', '', $phone);
            $stmt = $pdo->prepare('DELETE FROM blocked_users WHERE phone = ?');
            $stmt->execute([$phone]);
        } else {
            sendJSONResponse(['success' => false, 'error' => 'ID or phone number is required'], 400);
        }

        if ($stmt->rowCount() === 0) {
            sendJSONResponse(['success' => false, 'error' => 'Blocked user not found'], 404);
        }

        sendJSONResponse(['success' => true, 'message' => 'User unblocked successfully']);
        break;

    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

