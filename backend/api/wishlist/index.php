<?php
session_start();
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// Get user ID from JWT token
$userId = null;
if (isset($_COOKIE['auth_token'])) {
    $tokenData = verifyJWT($_COOKIE['auth_token']);
    if ($tokenData) {
        // Check for both 'userId' and 'user_id' (different naming conventions)
        $userId = $tokenData['userId'] ?? $tokenData['user_id'] ?? null;
    }
} else {
    // Debug: log if cookie is not set
    error_log('Wishlist API: auth_token cookie not found. Available cookies: ' . print_r($_COOKIE, true));
}

if (!$userId) {
    error_log('Wishlist API: User ID not found. Token data: ' . print_r($tokenData ?? 'No token data', true));
    sendJSONResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

switch ($method) {
    case 'GET':
        // Get user's wishlist
        $stmt = $pdo->prepare('
            SELECT w.*, 
                   p.name, p.slug, p.price, p.discount_price, p.discount, 
                   p.image, p.images, p.rating, p.reviews, p.in_stock
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ? AND p.is_active = 1
            ORDER BY w.created_at DESC
        ');
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($items as &$item) {
            $item['images'] = json_decode($item['images'] ?? '[]', true);
        }
        
        sendJSONResponse(['success' => true, 'wishlist' => $items]);
        break;
        
    case 'POST':
        // Add to wishlist
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = intval($data['product_id'] ?? 0);
        
        if ($productId <= 0) {
            sendJSONResponse(['success' => false, 'error' => 'Invalid product ID'], 400);
        }
        
        // Check if product exists
        $productStmt = $pdo->prepare('SELECT id FROM products WHERE id = ? AND is_active = 1');
        $productStmt->execute([$productId]);
        if (!$productStmt->fetch()) {
            sendJSONResponse(['success' => false, 'error' => 'Product not found'], 404);
        }
        
        // Check if already in wishlist
        $checkStmt = $pdo->prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?');
        $checkStmt->execute([$userId, $productId]);
        if ($checkStmt->fetch()) {
            sendJSONResponse(['success' => false, 'error' => 'Product already in wishlist'], 400);
        }
        
        // Add to wishlist
        $insertStmt = $pdo->prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)');
        $insertStmt->execute([$userId, $productId]);
        
        sendJSONResponse(['success' => true, 'message' => 'Product added to wishlist']);
        break;
        
    case 'DELETE':
        // Remove from wishlist
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = intval($data['product_id'] ?? 0);
        
        if ($productId <= 0) {
            sendJSONResponse(['success' => false, 'error' => 'Invalid product ID'], 400);
        }
        
        $deleteStmt = $pdo->prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?');
        $deleteStmt->execute([$userId, $productId]);
        
        if ($deleteStmt->rowCount() > 0) {
            sendJSONResponse(['success' => true, 'message' => 'Product removed from wishlist']);
        } else {
            sendJSONResponse(['success' => false, 'error' => 'Product not in wishlist'], 404);
        }
        break;
        
    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

