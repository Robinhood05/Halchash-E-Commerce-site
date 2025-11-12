<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        // Get hero products (ordered by hero_order)
        try {
            $stmt = $pdo->prepare('
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = 1 AND p.hero_order IS NOT NULL
                ORDER BY p.hero_order ASC
                LIMIT 3
            ');
            $stmt->execute();
            $heroProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Always return an array, even if empty
            if (empty($heroProducts)) {
                sendJSONResponse(['success' => true, 'products' => []]);
                return;
            }
            
            // Decode JSON fields
            foreach ($heroProducts as &$product) {
                $product['images'] = json_decode($product['images'] ?? '[]', true);
                $product['features'] = json_decode($product['features'] ?? '[]', true);
                // Convert to match frontend format
                $product['category'] = $product['category_slug'];
                $product['discountPrice'] = $product['discount_price'];
            }
            
            sendJSONResponse(['success' => true, 'products' => $heroProducts]);
        } catch (Exception $e) {
            error_log('Hero products API error: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'error' => 'Failed to fetch hero products', 'debug' => $e->getMessage()], 500);
        }
        break;
        
    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

