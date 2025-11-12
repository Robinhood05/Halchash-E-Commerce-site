<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$pdo = getDBConnection();

try {
    $stmt = $pdo->query("
        SELECT id, name, slug, icon, description, color
        FROM categories
        WHERE is_active = 1
        ORDER BY name ASC
    ");
    $categories = $stmt->fetchAll();

    // Ensure consistent structure for frontend
    foreach ($categories as &$category) {
        $category['icon'] = $category['icon'] ?? '';
        $category['description'] = $category['description'] ?? '';
        $category['color'] = $category['color'] ?? '';
    }

    sendJSONResponse([
        'success' => true,
        'categories' => $categories
    ]);
} catch (Exception $e) {
    sendJSONResponse([
        'success' => false,
        'error' => 'Failed to fetch categories'
    ], 500);
}

?>

