<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$pdo = getDBConnection();

// Get query parameters
$category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : '';
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;

$query = "
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
";

$params = [];

if (!empty($category)) {
    $query .= " AND (c.slug = ? OR c.id = ?)";
    $params[] = $category;
    $params[] = $category;
}

if (!empty($search)) {
    $query .= " AND (p.name LIKE ? OR p.description LIKE ?)";
    $searchTerm = "%{$search}%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

$query .= " ORDER BY p.created_at DESC";

if ($limit > 0) {
    $query .= " LIMIT ?";
    $params[] = $limit;
}

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Decode JSON fields
foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'] ?? '[]', true);
    $product['features'] = json_decode($product['features'] ?? '[]', true);
    // Convert to match frontend format
    $product['category'] = $product['category_slug'];
}

sendJSONResponse(['success' => true, 'products' => $products]);

?>

