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
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        switch ($action) {
            case 'reset_all_data':
                try {
                    $pdo->beginTransaction();

                    // Delete all reviews
                    $pdo->exec("DELETE FROM reviews");
                    
                    // Delete all order items
                    $pdo->exec("DELETE FROM order_items");
                    
                    // Delete all orders
                    $pdo->exec("DELETE FROM orders");

                    $pdo->commit();
                    sendJSONResponse([
                        'success' => true,
                        'message' => 'All order data, reviews, and analytics have been reset successfully.'
                    ]);
                } catch (Exception $e) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    error_log('Reset data error: ' . $e->getMessage());
                    sendJSONResponse(['success' => false, 'error' => 'Failed to reset data: ' . $e->getMessage()], 500);
                }
                break;

            default:
                sendJSONResponse(['success' => false, 'error' => 'Invalid action'], 400);
        }
        break;

    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

