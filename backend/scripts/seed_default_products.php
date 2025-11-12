<?php
/**
 * Seed default products into the database using the original static dataset.
 *
 * Usage (CLI):
 *   php backend/scripts/seed_default_products.php
 *
 * The script will:
 *   - Copy product images from `src/assets` into `backend/uploads/products`
 *   - Insert products that don't already exist (matched by slug)
 *   - Skip products when the category slug is missing in the database
 */

require_once __DIR__ . '/../config/database.php';

$rootDir = dirname(__DIR__, 2);
$frontendAssetsDir = $rootDir . '/src/assets/';
$uploadDir = dirname(__DIR__) . '/uploads/products/';

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        exit("❌ Failed to create upload directory: {$uploadDir}\n");
    }
}

$defaultProducts = [
    [
        'category_slug' => 'shari',
        'name' => 'Jamdani Shari - Traditional White & Gold',
        'description' => 'Authentic handwoven Jamdani shari from Dhaka with intricate gold thread work. Perfect for special occasions and festivals.',
        'price' => 3500,
        'discount_price' => 2800,
        'discount' => 20,
        'image_file' => 'jamdani-shari-1.jpg',
        'gallery_files' => [],
        'features' => ['100% Cotton', 'Handwoven', 'Traditional Design', 'Gold Thread Work'],
        'rating' => 4.8,
        'reviews' => 156,
        'badge' => 'Best Seller',
    ],
    [
        'category_slug' => 'shari',
        'name' => 'Katan Silk Shari - Deep Red',
        'description' => 'Premium Katan silk shari in rich deep red color with traditional Bengali border design.',
        'price' => 4200,
        'discount_price' => 3360,
        'discount' => 20,
        'image_file' => 'katan-shari-1.jpg',
        'gallery_files' => [],
        'features' => ['Pure Silk', 'Traditional Border', 'Rich Color', 'Premium Quality'],
        'rating' => 4.7,
        'reviews' => 89,
        'badge' => 'Premium',
    ],
    [
        'category_slug' => 'shari',
        'name' => 'Cotton Tant Shari - Blue & White',
        'description' => 'Comfortable cotton tant shari perfect for daily wear. Lightweight and breathable fabric.',
        'price' => 1800,
        'discount_price' => 1440,
        'discount' => 20,
        'image_file' => 'tant-shari-1.jpg',
        'gallery_files' => [],
        'features' => ['100% Cotton', 'Lightweight', 'Breathable', 'Daily Wear'],
        'rating' => 4.5,
        'reviews' => 234,
        'badge' => 'Popular',
    ],
    [
        'category_slug' => 'shari',
        'name' => 'Dhakai Muslin Shari - Cream',
        'description' => 'Exquisite Dhakai muslin shari, known for its fine texture and elegant drape.',
        'price' => 5500,
        'discount_price' => 4400,
        'discount' => 20,
        'image_file' => 'muslin-shari-1.jpg',
        'gallery_files' => [],
        'features' => ['Muslin Fabric', 'Fine Texture', 'Elegant Drape', 'Heritage Craft'],
        'rating' => 4.9,
        'reviews' => 67,
        'badge' => 'Heritage',
    ],
    [
        'category_slug' => 'sweets',
        'name' => 'Coconut Naru - Traditional Sweet',
        'description' => 'Handmade coconut naru prepared with fresh coconut and jaggery. Pack of 12 pieces.',
        'price' => 450,
        'discount_price' => 360,
        'discount' => 20,
        'image_file' => 'coconut-naru-1.jpg',
        'gallery_files' => [],
        'features' => ['Fresh Coconut', 'Natural Jaggery', 'Handmade', '12 Pieces'],
        'rating' => 4.6,
        'reviews' => 145,
        'badge' => 'Fresh',
    ],
    [
        'category_slug' => 'sweets',
        'name' => 'Date Palm Naru - Winter Special',
        'description' => 'Seasonal date palm naru made with fresh khejur gur (date palm jaggery). Limited time offer.',
        'price' => 520,
        'discount_price' => 416,
        'discount' => 20,
        'image_file' => 'date-naru-1.jpg',
        'gallery_files' => [],
        'features' => ['Date Palm Jaggery', 'Seasonal Special', 'Natural Sweetener', '10 Pieces'],
        'rating' => 4.8,
        'reviews' => 98,
        'badge' => 'Seasonal',
    ],
    [
        'category_slug' => 'sweets',
        'name' => 'Til Naru - Sesame Sweet Balls',
        'description' => 'Nutritious til (sesame) naru packed with protein and healthy fats. Perfect winter treat.',
        'price' => 380,
        'discount_price' => 304,
        'discount' => 20,
        'image_file' => 'til-naru-1.jpg',
        'gallery_files' => [],
        'features' => ['Sesame Seeds', 'High Protein', 'Healthy Fats', '14 Pieces'],
        'rating' => 4.4,
        'reviews' => 76,
        'badge' => 'Healthy',
    ],
    [
        'category_slug' => 'sweets',
        'name' => 'Mixed Dry Fruit Naru',
        'description' => 'Premium naru made with almonds, cashews, dates, and coconut. Rich in nutrients.',
        'price' => 680,
        'discount_price' => 544,
        'discount' => 20,
        'image_file' => 'mixed-naru-1.jpg',
        'gallery_files' => [],
        'features' => ['Mixed Dry Fruits', 'Premium Quality', 'Nutrient Rich', '8 Pieces'],
        'rating' => 4.7,
        'reviews' => 112,
        'badge' => 'Premium',
    ],
    [
        'category_slug' => 'bedsheets',
        'name' => 'Cotton Bed Sheet Set - Floral Print',
        'description' => 'Premium cotton bed sheet set with beautiful floral print. Includes 1 bed sheet and 2 pillow covers.',
        'price' => 2200,
        'discount_price' => 1760,
        'discount' => 20,
        'image_file' => 'bedsheet-floral-1.jpg',
        'gallery_files' => [],
        'features' => ['100% Cotton', 'Floral Print', 'King Size', '3 Piece Set'],
        'rating' => 4.5,
        'reviews' => 189,
        'badge' => 'Best Seller',
    ],
    [
        'category_slug' => 'bedsheets',
        'name' => 'Muslin Bed Sheet - Plain White',
        'description' => 'Soft and breathable muslin bed sheet in classic white. Perfect for all seasons.',
        'price' => 1800,
        'discount_price' => 1440,
        'discount' => 20,
        'image_file' => 'bedsheet-muslin-1.jpg',
        'gallery_files' => [],
        'features' => ['Muslin Fabric', 'Breathable', 'All Season', 'Queen Size'],
        'rating' => 4.6,
        'reviews' => 134,
        'badge' => 'Comfort',
    ],
    [
        'category_slug' => 'bedsheets',
        'name' => 'Jamdani Bed Cover - Traditional Design',
        'description' => 'Handwoven jamdani bed cover with traditional Bengali motifs. A piece of art for your bedroom.',
        'price' => 3200,
        'discount_price' => 2560,
        'discount' => 20,
        'image_file' => 'bedcover-jamdani-1.jpg',
        'gallery_files' => [],
        'features' => ['Handwoven', 'Traditional Motifs', 'Artistic Design', 'King Size'],
        'rating' => 4.8,
        'reviews' => 67,
        'badge' => 'Artistic',
    ],
    [
        'category_slug' => 'bedsheets',
        'name' => 'Khadi Cotton Bed Sheet Set',
        'description' => 'Eco-friendly khadi cotton bed sheet set. Naturally dyed with herbal colors.',
        'price' => 2800,
        'discount_price' => 2240,
        'discount' => 20,
        'image_file' => 'bedsheet-khadi-1.jpg',
        'gallery_files' => [],
        'features' => ['Khadi Cotton', 'Eco-Friendly', 'Natural Dyes', '4 Piece Set'],
        'rating' => 4.7,
        'reviews' => 98,
        'badge' => 'Eco-Friendly',
    ],
    [
        'category_slug' => 'traditional',
        'name' => 'Brass Kansa Plate Set',
        'description' => 'Traditional Bengali kansa (bronze) plate set. Healthy and eco-friendly dining option.',
        'price' => 1500,
        'discount_price' => 1200,
        'discount' => 20,
        'image_file' => 'kansa-plate-1.jpg',
        'gallery_files' => [],
        'features' => ['Pure Bronze', 'Healthy Dining', 'Traditional', 'Set of 4'],
        'rating' => 4.6,
        'reviews' => 87,
        'badge' => 'Traditional',
    ],
    [
        'category_slug' => 'traditional',
        'name' => 'Handwoven Nakshi Kantha',
        'description' => 'Beautiful handwoven nakshi kantha with traditional Bengali embroidery work.',
        'price' => 2500,
        'discount_price' => 2000,
        'discount' => 20,
        'image_file' => 'nakshi-kantha-1.jpg',
        'gallery_files' => [],
        'features' => ['Handwoven', 'Traditional Embroidery', 'Vintage Design', 'Large Size'],
        'rating' => 4.9,
        'reviews' => 45,
        'badge' => 'Handmade',
    ],
    [
        'category_slug' => 'traditional',
        'name' => 'Terracotta Tea Set',
        'description' => 'Authentic Bengali terracotta tea set. Enhances the flavor of tea naturally.',
        'price' => 800,
        'discount_price' => 640,
        'discount' => 20,
        'image_file' => 'terracotta-tea-1.jpg',
        'gallery_files' => [],
        'features' => ['Pure Terracotta', 'Natural Flavor', 'Eco-Friendly', '6 Piece Set'],
        'rating' => 4.4,
        'reviews' => 123,
        'badge' => 'Authentic',
    ],
    [
        'category_slug' => 'traditional',
        'name' => 'Bamboo Handicraft Basket',
        'description' => 'Handcrafted bamboo basket perfect for storage and decoration. Eco-friendly and durable.',
        'price' => 650,
        'discount_price' => 520,
        'discount' => 20,
        'image_file' => 'bamboo-basket-1.jpg',
        'gallery_files' => [],
        'features' => ['Bamboo Material', 'Handcrafted', 'Eco-Friendly', 'Multi-Purpose'],
        'rating' => 4.3,
        'reviews' => 156,
        'badge' => 'Eco-Friendly',
    ],
    [
        'category_slug' => 'beauty',
        'name' => 'Neem & Turmeric Face Pack',
        'description' => 'Natural face pack made with neem and turmeric. Perfect for acne-prone skin.',
        'price' => 320,
        'discount_price' => 256,
        'discount' => 20,
        'image_file' => 'neem-facepack-1.jpg',
        'gallery_files' => [],
        'features' => ['Natural Ingredients', 'Neem & Turmeric', 'Acne Treatment', '100g'],
        'rating' => 4.5,
        'reviews' => 234,
        'badge' => 'Natural',
    ],
    [
        'category_slug' => 'beauty',
        'name' => 'Coconut Oil - Cold Pressed',
        'description' => 'Pure cold-pressed coconut oil for hair and skin care. Chemical-free and organic.',
        'price' => 450,
        'discount_price' => 360,
        'discount' => 20,
        'image_file' => 'coconut-oil-1.jpg',
        'gallery_files' => [],
        'features' => ['Cold Pressed', 'Organic', 'Multi-Purpose', '500ml'],
        'rating' => 4.7,
        'reviews' => 189,
        'badge' => 'Organic',
    ],
    [
        'category_slug' => 'beauty',
        'name' => 'Herbal Hair Oil - Ayurvedic',
        'description' => 'Traditional ayurvedic hair oil with 21 herbs. Promotes hair growth and prevents dandruff.',
        'price' => 380,
        'discount_price' => 304,
        'discount' => 20,
        'image_file' => 'herbal-oil-1.jpg',
        'gallery_files' => [],
        'features' => ['21 Herbs', 'Hair Growth', 'Anti-Dandruff', '200ml'],
        'rating' => 4.6,
        'reviews' => 167,
        'badge' => 'Ayurvedic',
    ],
    [
        'category_slug' => 'beauty',
        'name' => 'Rose Water - Pure & Natural',
        'description' => 'Pure rose water for face toning and refreshing. Made from fresh rose petals.',
        'price' => 280,
        'discount_price' => 224,
        'discount' => 20,
        'image_file' => 'rose-water-1.jpg',
        'gallery_files' => [],
        'features' => ['Pure Rose Water', 'Natural Toner', 'Refreshing', '250ml'],
        'rating' => 4.4,
        'reviews' => 198,
        'badge' => 'Pure',
    ],
];

$pdo = getDBConnection();
$pdo->beginTransaction();

$inserted = 0;
$skipped = 0;

$categoryStmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
$productStmt = $pdo->prepare('SELECT id FROM products WHERE slug = ? LIMIT 1');
$insertStmt = $pdo->prepare("
    INSERT INTO products (
        category_id, name, slug, description, price, discount_price, discount,
        image, images, features, rating, reviews, in_stock, stock_quantity, badge, is_active
    ) VALUES (
        :category_id, :name, :slug, :description, :price, :discount_price, :discount,
        :image, :images, :features, :rating, :reviews, :in_stock, :stock_quantity, :badge, :is_active
    )
");

function copyImage(string $filename, string $slug, string $frontendAssetsDir, string $uploadDir): ?string
{
    if (empty($filename)) {
        return null;
    }

    $sourcePath = $frontendAssetsDir . $filename;

    if (!file_exists($sourcePath)) {
        echo "⚠️  Image file not found for {$slug}: {$filename}\n";
        return null;
    }

    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $targetName = $slug . '_' . uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $targetName;

    if (!copy($sourcePath, $targetPath)) {
        echo "⚠️  Failed to copy image for {$slug}: {$filename}\n";
        return null;
    }

    return '/backend/uploads/products/' . $targetName;
}

try {
    foreach ($defaultProducts as $productData) {
        $categorySlug = $productData['category_slug'];
        $categoryStmt->execute([$categorySlug]);
        $category = $categoryStmt->fetch();

        if (!$category) {
            echo "⚠️  Skipping {$productData['name']} - category '{$categorySlug}' not found.\n";
            $skipped++;
            continue;
        }

        $slug = generateSlug($productData['name']);
        $productStmt->execute([$slug]);

        if ($productStmt->fetch()) {
            echo "ℹ️  Skipping {$productData['name']} - product already exists.\n";
            $skipped++;
            continue;
        }

        $imagePath = copyImage($productData['image_file'], $slug, $frontendAssetsDir, $uploadDir);
        $galleryPaths = [];

        foreach ($productData['gallery_files'] as $galleryFile) {
            $copiedPath = copyImage($galleryFile, $slug, $frontendAssetsDir, $uploadDir);
            if ($copiedPath) {
                $galleryPaths[] = $copiedPath;
            }
        }

        if ($imagePath && empty($galleryPaths)) {
            $galleryPaths[] = $imagePath;
        }

        $features = json_encode($productData['features'], JSON_UNESCAPED_UNICODE);
        $galleryJson = json_encode($galleryPaths, JSON_UNESCAPED_SLASHES);

        $insertStmt->execute([
            ':category_id' => $category['id'],
            ':name' => $productData['name'],
            ':slug' => $slug,
            ':description' => $productData['description'],
            ':price' => $productData['price'],
            ':discount_price' => $productData['discount_price'],
            ':discount' => $productData['discount'],
            ':image' => $imagePath,
            ':images' => $galleryJson ?: '[]',
            ':features' => $features ?: '[]',
            ':rating' => $productData['rating'],
            ':reviews' => $productData['reviews'],
            ':in_stock' => 1,
            ':stock_quantity' => $productData['stock_quantity'] ?? 100,
            ':badge' => $productData['badge'] ?? '',
            ':is_active' => 1,
        ]);

        echo "✅ Inserted {$productData['name']}\n";
        $inserted++;
    }

    $pdo->commit();
    echo "\nDone! Inserted {$inserted} products, skipped {$skipped}.\n";
} catch (Exception $e) {
    $pdo->rollBack();
    exit("❌ Seeding failed: " . $e->getMessage() . "\n");
}


