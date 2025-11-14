<?php
session_start();
require_once '../../config/cors.php';
require_once '../../config/database.php';

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    sendJSONResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        // Get all products or single product
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id > 0) {
            $stmt = $pdo->prepare("
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            
            if ($product) {
                // Decode JSON fields
                $product['images'] = json_decode($product['images'] ?? '[]', true);
                $product['features'] = json_decode($product['features'] ?? '[]', true);
            }
            
            sendJSONResponse(['success' => true, 'product' => $product]);
        } else {
            $stmt = $pdo->query("
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC
            ");
            $products = $stmt->fetchAll();
            
            // Decode JSON fields for each product
            foreach ($products as &$product) {
                $product['images'] = json_decode($product['images'] ?? '[]', true);
                $product['features'] = json_decode($product['features'] ?? '[]', true);
            }
            
            sendJSONResponse(['success' => true, 'products' => $products]);
        }
        break;

    case 'POST':
        // Create product
        $data = json_decode(file_get_contents('php://input'), true);
        
        $category_id = intval($data['category_id'] ?? 0);
        $name = sanitizeInput($data['name'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $price = floatval($data['price'] ?? 0);
        $discount_price = isset($data['discount_price']) ? floatval($data['discount_price']) : null;
        $discount = intval($data['discount'] ?? 0);
        $image = sanitizeInput($data['image'] ?? '');
        $images = isset($data['images']) ? json_encode($data['images']) : '[]';
        $features = isset($data['features']) ? json_encode($data['features']) : '[]';
        $rating = floatval($data['rating'] ?? 0);
        $reviews = intval($data['reviews'] ?? 0);
        $in_stock = isset($data['in_stock']) ? (bool)$data['in_stock'] : true;
        $stock_quantity = intval($data['stock_quantity'] ?? 0);
        $badge = sanitizeInput($data['badge'] ?? '');
        $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
        
        if (empty($name) || $category_id === 0 || $price <= 0) {
            sendJSONResponse(['success' => false, 'error' => 'Name, category, and price are required']);
        }

        $slug = generateSlug($name);
        
        // Check if slug exists
        $stmt = $pdo->prepare("SELECT id FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . time();
        }

        $stmt = $pdo->prepare("
            INSERT INTO products (
                category_id, name, slug, description, price, discount_price, discount,
                image, images, features, rating, reviews, in_stock, stock_quantity, badge, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $category_id, $name, $slug, $description, $price, $discount_price, $discount,
            $image, $images, $features, $rating, $reviews, $in_stock, $stock_quantity, $badge, $is_active
        ]);
        
        $productId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        $product['images'] = json_decode($product['images'], true);
        $product['features'] = json_decode($product['features'], true);
        
        sendJSONResponse(['success' => true, 'product' => $product, 'message' => 'Product created successfully']);
        break;

    case 'PUT':
        // Update product
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        
        if ($id === 0) {
            sendJSONResponse(['success' => false, 'error' => 'Product ID is required']);
        }

        $category_id = intval($data['category_id'] ?? 0);
        $name = sanitizeInput($data['name'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $price = floatval($data['price'] ?? 0);
        $discount_price = isset($data['discount_price']) ? floatval($data['discount_price']) : null;
        $discount = intval($data['discount'] ?? 0);
        $image = sanitizeInput($data['image'] ?? '');
        $images = isset($data['images']) ? json_encode($data['images']) : '[]';
        $features = isset($data['features']) ? json_encode($data['features']) : '[]';
        $rating = floatval($data['rating'] ?? 0);
        $reviews = intval($data['reviews'] ?? 0);
        $in_stock = isset($data['in_stock']) ? (bool)$data['in_stock'] : true;
        $stock_quantity = intval($data['stock_quantity'] ?? 0);
        $badge = sanitizeInput($data['badge'] ?? '');
        $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
        
        if (empty($name) || $category_id === 0 || $price <= 0) {
            sendJSONResponse(['success' => false, 'error' => 'Name, category, and price are required']);
        }

        $slug = generateSlug($name);
        
        // Check if slug exists for other products
        $stmt = $pdo->prepare("SELECT id FROM products WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $id]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . $id;
        }

        $stmt = $pdo->prepare("
            UPDATE products 
            SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, discount_price = ?, discount = ?,
                image = ?, images = ?, features = ?, rating = ?, reviews = ?, in_stock = ?, stock_quantity = ?, badge = ?, is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $category_id, $name, $slug, $description, $price, $discount_price, $discount,
            $image, $images, $features, $rating, $reviews, $in_stock, $stock_quantity, $badge, $is_active, $id
        ]);
        
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        $product['images'] = json_decode($product['images'], true);
        $product['features'] = json_decode($product['features'], true);
        
        sendJSONResponse(['success' => true, 'product' => $product, 'message' => 'Product updated successfully']);
        break;

    case 'DELETE':
        // Delete product
        $id = intval($_GET['id'] ?? 0);
        
        if ($id === 0) {
            sendJSONResponse(['success' => false, 'error' => 'Product ID is required']);
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        
        sendJSONResponse(['success' => true, 'message' => 'Product deleted successfully']);
        break;

    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

?>

