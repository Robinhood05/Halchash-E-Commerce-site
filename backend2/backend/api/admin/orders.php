<?php
session_start();
require_once '../../config/cors.php';
require_once '../../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    sendJSONResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0) {
            $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
            $stmt->execute([$id]);
            $order = $stmt->fetch();

            if (!$order) {
                sendJSONResponse(['success' => false, 'error' => 'Order not found'], 404);
            }

            // Get order items with product images
            $itemsStmt = $pdo->prepare('
                SELECT oi.*, 
                       p.image as product_image,
                       p.images as product_images
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ');
            $itemsStmt->execute([$id]);
            $items = $itemsStmt->fetchAll();
            
            // Decode JSON images for each item
            foreach ($items as &$item) {
                if ($item['product_images']) {
                    $item['product_images'] = json_decode($item['product_images'], true);
                } else {
                    $item['product_images'] = [];
                }
                // Ensure we have at least the main image
                if (!$item['product_image'] && !empty($item['product_images'])) {
                    $item['product_image'] = $item['product_images'][0];
                }
            }
            
            $order['items'] = $items;

            sendJSONResponse(['success' => true, 'order' => $order]);
        } else {
            // Get all orders with items count and total
            $stmt = $pdo->query('
                SELECT o.*, 
                       COUNT(oi.id) as items_count,
                       COALESCE(SUM(oi.subtotal), 0) as items_total
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ');
            $orders = $stmt->fetchAll();
            
            // Get statistics
            $stats = [
                'total_orders' => $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
                'pending_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
                'processing_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'processing'")->fetchColumn(),
                'delivered_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'delivered'")->fetchColumn(),
                'cancelled_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
                'total_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered'")->fetchColumn(),
                'cancelled_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
            ];
            
            sendJSONResponse(['success' => true, 'orders' => $orders, 'stats' => $stats]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $status = $data['status'] ?? '';

        $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $allowedStatuses, true)) {
            sendJSONResponse(['success' => false, 'error' => 'Invalid status']);
        }

        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);

        sendJSONResponse(['success' => true, 'message' => 'Order status updated']);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);

        if ($id <= 0) {
            sendJSONResponse(['success' => false, 'error' => 'Invalid order ID'], 400);
        }

        try {
            $pdo->beginTransaction();

            // Delete order items first (due to foreign key constraint)
            $stmt = $pdo->prepare('DELETE FROM order_items WHERE order_id = ?');
            $stmt->execute([$id]);

            // Delete reviews associated with this order
            $stmt = $pdo->prepare('DELETE FROM reviews WHERE order_id = ?');
            $stmt->execute([$id]);

            // Delete the order
            $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                sendJSONResponse(['success' => false, 'error' => 'Order not found'], 404);
            }

            $pdo->commit();
            sendJSONResponse(['success' => true, 'message' => 'Order deleted permanently']);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Delete order error: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'error' => 'Failed to delete order: ' . $e->getMessage()], 500);
        }
        break;

    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>
