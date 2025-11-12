<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'create';
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    
    $category_id = intval($_POST['category_id']);
    $name = sanitizeInput($_POST['name']);
    $description = sanitizeInput($_POST['description']);
    $price = floatval($_POST['price']);
    $discount_price = !empty($_POST['discount_price']) ? floatval($_POST['discount_price']) : null;
    $discount = intval($_POST['discount'] ?? 0);
    $stock_quantity = intval($_POST['stock_quantity'] ?? 0);
    $badge = sanitizeInput($_POST['badge'] ?? '');
    $in_stock = isset($_POST['in_stock']) ? 1 : 0;
    $is_active = isset($_POST['is_active']) ? 1 : 0;
    
    // Handle features
    $features_text = $_POST['features_text'] ?? '';
    $features_array = array_filter(array_map('trim', explode("\n", $features_text)));
    $features = json_encode($features_array);
    
    // Handle image upload
    $image = $_POST['existing_image'] ?? '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $file = $_FILES['image'];
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'product_' . time() . '_' . uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $image = '/backend/uploads/products/' . $filename;
        }
    }
    
    $slug = generateSlug($name);
    
    if ($action === 'create') {
        // Check if slug exists
        $stmt = $pdo->prepare("SELECT id FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . time();
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO products (
                category_id, name, slug, description, price, discount_price, discount,
                image, images, features, in_stock, stock_quantity, badge, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $category_id, $name, $slug, $description, $price, $discount_price, $discount,
            $image, $features, $in_stock, $stock_quantity, $badge, $is_active
        ]);
        
        $message = 'Product created successfully';
    } else {
        // Check if slug exists for other products
        $stmt = $pdo->prepare("SELECT id FROM products WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $id]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . $id;
        }
        
        $stmt = $pdo->prepare("
            UPDATE products 
            SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, discount_price = ?, discount = ?,
                image = ?, features = ?, in_stock = ?, stock_quantity = ?, badge = ?, is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $category_id, $name, $slug, $description, $price, $discount_price, $discount,
            $image, $features, $in_stock, $stock_quantity, $badge, $is_active, $id
        ]);
        
        $message = 'Product updated successfully';
    }
    
    $messageType = 'success';
    header('Location: products.php?message=' . urlencode($message) . '&type=' . $messageType);
    exit;
}

header('Location: products.php');
exit;
?>

