<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$inputData = json_decode(file_get_contents('php://input'), true);
$userId = intval($inputData['user_id'] ?? 0);
$productId = intval($inputData['product_id'] ?? 0);
$orderId = intval($inputData['order_id'] ?? 0);
$rating = intval($inputData['rating'] ?? 0);
$comment = sanitizeInput($inputData['comment'] ?? '');

// Validation
if ($userId <= 0) {
    sendJSONResponse(['success' => false, 'error' => 'User ID is required'], 401);
}

if ($productId <= 0 || $orderId <= 0) {
    sendJSONResponse(['success' => false, 'error' => 'Product ID and Order ID are required']);
}

if ($rating < 1 || $rating > 5) {
    sendJSONResponse(['success' => false, 'error' => 'Rating must be between 1 and 5']);
}

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();

    // Verify order belongs to user and is delivered
    $stmt = $pdo->prepare('SELECT id, status FROM orders WHERE id = ? AND user_id = ?');
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch();

    if (!$order) {
        sendJSONResponse(['success' => false, 'error' => 'Order not found or does not belong to you'], 404);
    }

    if ($order['status'] !== 'delivered') {
        sendJSONResponse(['success' => false, 'error' => 'You can only review products from delivered orders']);
    }

    // Verify product was in this order
    $stmt = $pdo->prepare('SELECT id FROM order_items WHERE order_id = ? AND product_id = ?');
    $stmt->execute([$orderId, $productId]);
    $orderItem = $stmt->fetch();

    if (!$orderItem) {
        sendJSONResponse(['success' => false, 'error' => 'Product was not in this order']);
    }

    // Check if review already exists
    $stmt = $pdo->prepare('SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?');
    $stmt->execute([$userId, $productId, $orderId]);
    if ($stmt->fetch()) {
        sendJSONResponse(['success' => false, 'error' => 'You have already reviewed this product for this order']);
    }

    // Insert review
    $stmt = $pdo->prepare('INSERT INTO reviews (user_id, product_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$userId, $productId, $orderId, $rating, $comment]);

    // Calculate new average rating for product
    $stmt = $pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?');
    $stmt->execute([$productId]);
    $ratingData = $stmt->fetch();
    
    $newRating = round($ratingData['avg_rating'], 2);
    $reviewCount = intval($ratingData['review_count']);

    // Update product rating and review count
    $stmt = $pdo->prepare('UPDATE products SET rating = ?, reviews = ? WHERE id = ?');
    $stmt->execute([$newRating, $reviewCount, $productId]);

    $pdo->commit();

    sendJSONResponse([
        'success' => true,
        'message' => 'Review submitted successfully',
        'review' => [
            'id' => $pdo->lastInsertId(),
            'rating' => $rating,
            'comment' => $comment
        ],
        'product' => [
            'id' => $productId,
            'rating' => $newRating,
            'reviews' => $reviewCount
        ]
    ]);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Review creation error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to submit review'], 500);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Review creation error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to submit review'], 500);
}
?>

