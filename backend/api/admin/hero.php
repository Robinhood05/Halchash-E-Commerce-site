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
        // Get all products with hero status
        $stmt = $pdo->query('
            SELECT p.id, p.name, p.image, p.hero_order, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
            ORDER BY p.hero_order ASC, p.name ASC
        ');
        $products = $stmt->fetchAll();
        
        // Get current hero products
        $heroStmt = $pdo->query('
            SELECT p.id, p.name, p.image, p.hero_order, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1 AND p.hero_order IS NOT NULL
            ORDER BY p.hero_order ASC
        ');
        $heroProducts = $heroStmt->fetchAll();
        
        sendJSONResponse([
            'success' => true, 
            'products' => $products,
            'heroProducts' => $heroProducts
        ]);
        break;
        
    case 'PUT':
        // Update hero products
        $data = json_decode(file_get_contents('php://input'), true);
        $heroProducts = $data['heroProducts'] ?? []; // Array of product IDs [id1, id2, id3]
        
        error_log('Hero update request: ' . json_encode($heroProducts));
        
        if (count($heroProducts) > 5) {
            sendJSONResponse(['success' => false, 'error' => 'Maximum 5 products allowed in hero section'], 400);
        }
        
        try {
            // Check if hero_order column exists
            $checkColumn = $pdo->query("SHOW COLUMNS FROM products LIKE 'hero_order'");
            if (!$checkColumn->fetch()) {
                // Column doesn't exist, create it
                $pdo->exec("ALTER TABLE products ADD COLUMN hero_order INT DEFAULT NULL COMMENT 'Position in hero section (1-3), NULL means not in hero'");
                error_log('Created hero_order column');
            }
            
            $pdo->beginTransaction();
            
            // Clear all hero orders
            $pdo->exec('UPDATE products SET hero_order = NULL');
            
            // Set new hero orders
            $updated = [];
            foreach ($heroProducts as $index => $productId) {
                $order = $index + 1; // 1, 2, or 3
                $productId = intval($productId);
                $stmt = $pdo->prepare('UPDATE products SET hero_order = ? WHERE id = ?');
                $result = $stmt->execute([$order, $productId]);
                $updated[] = ['id' => $productId, 'order' => $order, 'success' => $result];
            }
            
            $pdo->commit();
            error_log('Hero products updated: ' . json_encode($updated));
            sendJSONResponse(['success' => true, 'message' => 'Hero products updated successfully', 'updated' => $updated]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Hero update error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            sendJSONResponse(['success' => false, 'error' => 'Failed to update hero products: ' . $e->getMessage()], 500);
        }
        break;
        
    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

