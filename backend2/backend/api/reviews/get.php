<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$productId = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;

if ($productId <= 0) {
    sendJSONResponse(['success' => false, 'error' => 'Product ID is required']);
}

try {
    $pdo = getDBConnection();
    
    // Get reviews with user information
    $stmt = $pdo->prepare("
        SELECT r.*, u.name as user_name, u.avatar as user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$productId]);
    $reviews = $stmt->fetchAll();
    
    sendJSONResponse([
        'success' => true,
        'reviews' => $reviews
    ]);
    
} catch (PDOException $e) {
    error_log('Get reviews error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to fetch reviews'], 500);
}
?>

