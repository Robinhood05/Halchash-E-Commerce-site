<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// Get user ID from session or request
session_start();
$userId = $_GET['user_id'] ?? $_SESSION['user_id'] ?? null;

if (!$userId) {
    sendJSONResponse(['success' => false, 'error' => 'User ID is required'], 400);
}

$status = $_GET['status'] ?? null;

try {
    $pdo = getDBConnection();
    
    // Build query
    $query = "
        SELECT o.*, 
               COUNT(oi.id) as items_count,
               GROUP_CONCAT(oi.product_id) as product_ids
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
    ";
    
    $params = [$userId];
    
    if ($status) {
        $query .= " AND o.status = ?";
        $params[] = $status;
    }
    
    $query .= " GROUP BY o.id ORDER BY o.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll();
        
        // Check which products have been reviewed
        if ($order['status'] === 'delivered') {
            $productIds = array_filter(explode(',', $order['product_ids'] ?? ''));
            if (!empty($productIds)) {
                $placeholders = implode(',', array_fill(0, count($productIds), '?'));
                $reviewStmt = $pdo->prepare("
                    SELECT product_id 
                    FROM reviews 
                    WHERE user_id = ? AND order_id = ? AND product_id IN ($placeholders)
                ");
                $reviewParams = array_merge([$userId, $order['id']], $productIds);
                $reviewStmt->execute($reviewParams);
                $reviewedProducts = $reviewStmt->fetchAll(PDO::FETCH_COLUMN);
                
                // Add reviewed flag to items
                foreach ($order['items'] as &$item) {
                    $item['reviewed'] = in_array($item['product_id'], $reviewedProducts);
                }
            }
        }
    }
    
    // Get order statistics
    $statsStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders 
        WHERE user_id = ?
    ");
    $statsStmt->execute([$userId]);
    $stats = $statsStmt->fetch();
    
    sendJSONResponse([
        'success' => true,
        'orders' => $orders,
        'stats' => $stats
    ]);
    
} catch (PDOException $e) {
    error_log('User orders error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to fetch orders'], 500);
}
?>

