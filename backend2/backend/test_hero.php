<?php
require_once 'config/database.php';

$pdo = getDBConnection();

// Check if hero_order column exists
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM products LIKE 'hero_order'");
    $column = $stmt->fetch();
    
    if (!$column) {
        echo "❌ hero_order column does not exist. Please run the migration:\n";
        echo "ALTER TABLE products ADD COLUMN hero_order INT DEFAULT NULL;\n";
    } else {
        echo "✅ hero_order column exists\n";
    }
} catch (Exception $e) {
    echo "❌ Error checking column: " . $e->getMessage() . "\n";
}

// Check products with hero_order
try {
    $stmt = $pdo->query("
        SELECT id, name, hero_order 
        FROM products 
        WHERE hero_order IS NOT NULL 
        ORDER BY hero_order ASC
    ");
    $heroProducts = $stmt->fetchAll();
    
    echo "\n📦 Products with hero_order set:\n";
    if (empty($heroProducts)) {
        echo "   No products found with hero_order set.\n";
    } else {
        foreach ($heroProducts as $product) {
            echo "   - ID: {$product['id']}, Name: {$product['name']}, Order: {$product['hero_order']}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error fetching products: " . $e->getMessage() . "\n";
}

// Test the API query
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
    $heroProducts = $stmt->fetchAll();
    
    echo "\n🔍 API Query Results:\n";
    if (empty($heroProducts)) {
        echo "   No products returned by API query.\n";
    } else {
        foreach ($heroProducts as $product) {
            echo "   - ID: {$product['id']}, Name: {$product['name']}, Order: {$product['hero_order']}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error in API query: " . $e->getMessage() . "\n";
}

?>

