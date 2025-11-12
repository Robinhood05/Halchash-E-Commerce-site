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
        // Get all categories
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
        $categories = $stmt->fetchAll();
        sendJSONResponse(['success' => true, 'categories' => $categories]);
        break;

    case 'POST':
        // Create category
        $data = json_decode(file_get_contents('php://input'), true);
        $name = sanitizeInput($data['name'] ?? '');
        $icon = sanitizeInput($data['icon'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $color = sanitizeInput($data['color'] ?? '');
        
        if (empty($name)) {
            sendJSONResponse(['success' => false, 'error' => 'Category name is required']);
        }

        $slug = generateSlug($name);
        
        // Check if slug exists
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . time();
        }

        $stmt = $pdo->prepare("
            INSERT INTO categories (name, slug, icon, description, color) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $slug, $icon, $description, $color]);
        
        $categoryId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$categoryId]);
        $category = $stmt->fetch();
        
        sendJSONResponse(['success' => true, 'category' => $category, 'message' => 'Category created successfully']);
        break;

    case 'PUT':
        // Update category
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $name = sanitizeInput($data['name'] ?? '');
        $icon = sanitizeInput($data['icon'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $color = sanitizeInput($data['color'] ?? '');
        $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
        
        if (empty($name) || $id === 0) {
            sendJSONResponse(['success' => false, 'error' => 'Category ID and name are required']);
        }

        $slug = generateSlug($name);
        
        // Check if slug exists for other categories
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $id]);
        if ($stmt->fetch()) {
            $slug = $slug . '-' . $id;
        }

        $stmt = $pdo->prepare("
            UPDATE categories 
            SET name = ?, slug = ?, icon = ?, description = ?, color = ?, is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $slug, $icon, $description, $color, $is_active, $id]);
        
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $category = $stmt->fetch();
        
        sendJSONResponse(['success' => true, 'category' => $category, 'message' => 'Category updated successfully']);
        break;

    case 'DELETE':
        // Delete category
        $id = intval($_GET['id'] ?? 0);
        
        if ($id === 0) {
            sendJSONResponse(['success' => false, 'error' => 'Category ID is required']);
        }

        // Check if category has products
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            sendJSONResponse(['success' => false, 'error' => 'Cannot delete category with existing products']);
        }

        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        
        sendJSONResponse(['success' => true, 'message' => 'Category deleted successfully']);
        break;

    default:
        sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

?>

