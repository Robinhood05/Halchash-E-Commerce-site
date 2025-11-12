<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();

// Check if hero_order column exists, if not add it
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM products LIKE 'hero_order'");
    $column = $stmt->fetch();
    
    if (!$column) {
        // Column doesn't exist, add it
        $pdo->exec("ALTER TABLE products ADD COLUMN hero_order INT DEFAULT NULL COMMENT 'Position in hero section (1-3), NULL means not in hero'");
    }
} catch (Exception $e) {
    // Column might already exist or other error, continue
    error_log('Hero order column check: ' . $e->getMessage());
}

// Handle form submission via AJAX (will be handled by JavaScript)

// Get all products
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Hero Products - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 p-8">
            <h1 class="text-3xl font-bold mb-6">Manage Hero Products</h1>
            
            <?php if (isset($success)): ?>
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>
            
            <?php if (isset($error)): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-xl font-bold mb-4">Current Hero Products (Maximum 3)</h2>
                <div id="heroProductsList" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <?php if (empty($heroProducts)): ?>
                        <p class="text-gray-500 col-span-3">No products in hero section</p>
                    <?php else: ?>
                        <?php foreach ($heroProducts as $product): ?>
                            <div class="border rounded-lg p-4 hero-product-item" data-product-id="<?php echo $product['id']; ?>">
                                <div class="flex items-center space-x-3">
                                    <span class="bg-orange-500 text-white px-3 py-1 rounded font-bold">
                                        #<?php echo $product['hero_order']; ?>
                                    </span>
                                    <?php 
                                    // Fix image path for admin panel
                                    // Images in DB: /backend/uploads/products/filename.jpg
                                    // From backend/admin/, we need: ../uploads/products/filename.jpg
                                    $heroImageUrl = 'https://placehold.co/64x64?text=No+Image';
                                    if ($product['image']) {
                                        if (strpos($product['image'], 'http') === 0 || strpos($product['image'], '//') === 0) {
                                            $heroImageUrl = $product['image'];
                                        } else {
                                            // Handle both /backend/uploads/... and backend/uploads/... formats
                                            $imagePath = ltrim($product['image'], '/');
                                            // Remove 'backend/' prefix if present
                                            if (strpos($imagePath, 'backend/') === 0) {
                                                $imagePath = substr($imagePath, 8);
                                            }
                                            $heroImageUrl = '../' . $imagePath;
                                        }
                                    }
                                    ?>
                                    <img src="<?php echo htmlspecialchars($heroImageUrl); ?>" 
                                         alt="<?php echo htmlspecialchars($product['name']); ?>"
                                         class="w-16 h-16 object-cover rounded">
                                    <div class="flex-1">
                                        <h3 class="font-semibold"><?php echo htmlspecialchars($product['name']); ?></h3>
                                        <p class="text-sm text-gray-500"><?php echo htmlspecialchars($product['category_name']); ?></p>
                                    </div>
                                    <button onclick="removeFromHero(<?php echo $product['id']; ?>)" 
                                            class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4">All Products</h2>
                <div class="mb-4">
                    <input type="text" 
                           id="searchProducts" 
                           placeholder="Search products..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto" id="productsList">
                    <?php foreach ($products as $product): ?>
                        <?php 
                        $isInHero = $product['hero_order'] !== null;
                        $isDisabled = $isInHero || count($heroProducts) >= 3;
                        // Fix image path for admin panel
                        $imageUrl = 'https://placehold.co/64x64?text=No+Image';
                        if ($product['image']) {
                            if (strpos($product['image'], 'http') === 0 || strpos($product['image'], '//') === 0) {
                                $imageUrl = $product['image'];
                            } else {
                                // Handle both /backend/uploads/... and backend/uploads/... formats
                                $imagePath = ltrim($product['image'], '/');
                                // Remove 'backend/' prefix if present
                                if (strpos($imagePath, 'backend/') === 0) {
                                    $imagePath = substr($imagePath, 8);
                                }
                                $imageUrl = '../' . $imagePath;
                            }
                        }
                        ?>
                        <div class="border rounded-lg p-4 <?php echo $isInHero ? 'bg-orange-50 border-orange-300' : ''; ?>">
                            <div class="flex items-center space-x-3">
                                <img src="<?php echo htmlspecialchars($imageUrl); ?>" 
                                     alt="<?php echo htmlspecialchars($product['name']); ?>"
                                     class="w-16 h-16 object-cover rounded">
                                <div class="flex-1">
                                    <h3 class="font-semibold"><?php echo htmlspecialchars($product['name']); ?></h3>
                                    <p class="text-sm text-gray-500"><?php echo htmlspecialchars($product['category_name']); ?></p>
                                    <?php if ($isInHero): ?>
                                        <span class="text-xs bg-orange-500 text-white px-2 py-1 rounded">Hero #<?php echo $product['hero_order']; ?></span>
                                    <?php endif; ?>
                                </div>
                                <button onclick="addToHero(<?php echo $product['id']; ?>)" 
                                        <?php echo $isDisabled ? 'disabled' : ''; ?>
                                        class="<?php echo $isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'; ?> text-white px-4 py-2 rounded <?php echo $isDisabled ? '' : 'hover:shadow-lg'; ?>"
                                        <?php echo $isDisabled ? 'title="Already in hero or hero section is full"' : ''; ?>>
                                    <?php echo $isInHero ? '<i class="fas fa-check"></i>' : '<i class="fas fa-plus"></i>'; ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div class="mt-6">
                <button type="button" 
                        onclick="saveHeroProducts()"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                    Save Hero Products
                </button>
            </div>
        </div>
    </div>
    
    <script>
        let heroProducts = <?php echo json_encode(array_column($heroProducts, 'id')); ?>;
        
        function updateHeroProductsList() {
            const list = document.getElementById('heroProductsList');
            
            // Clear the list
            list.innerHTML = '';
            
            if (heroProducts.length === 0) {
                list.innerHTML = '<p class="text-gray-500 col-span-3">No products in hero section</p>';
                return;
            }
            
            // Fetch product details for the hero products
            fetch('../api/admin/hero.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Create a map of all products for quick lookup
                        const productMap = {};
                        data.products.forEach(product => {
                            productMap[product.id] = product;
                        });
                        
                        // Display hero products in order
                        heroProducts.forEach((productId, index) => {
                            const product = productMap[productId];
                            if (!product) return;
                            
                            const div = document.createElement('div');
                            div.className = 'border rounded-lg p-4 hero-product-item';
                            div.setAttribute('data-product-id', product.id);
                            
                            // Fix image path - remove /backend prefix if present
                            let imageUrl = 'https://placehold.co/64x64?text=No+Image';
                            if (product.image) {
                                if (product.image.startsWith('http')) {
                                    imageUrl = product.image;
                                } else {
                                    let imagePath = product.image.replace(/^\/+/, ''); // Remove leading slashes
                                    if (imagePath.startsWith('backend/')) {
                                        imagePath = imagePath.substring(8); // Remove 'backend/'
                                    }
                                    imageUrl = '../' + imagePath;
                                }
                            }
                            
                            const order = index + 1;
                            div.innerHTML = `
                                <div class="flex items-center space-x-3">
                                    <span class="bg-orange-500 text-white px-3 py-1 rounded font-bold">
                                        #${order}
                                    </span>
                                    <img src="${imageUrl}" 
                                         alt="${product.name}"
                                         class="w-16 h-16 object-cover rounded">
                                    <div class="flex-1">
                                        <h3 class="font-semibold">${product.name}</h3>
                                        <p class="text-sm text-gray-500">${product.category_name || ''}</p>
                                    </div>
                                    <button onclick="removeFromHero(${product.id})" 
                                            class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
                            list.appendChild(div);
                        });
                        
                        // Update the product list buttons to reflect current state
                        updateProductListButtons();
                    }
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                    list.innerHTML = '<p class="text-red-500 col-span-3">Error loading products</p>';
                });
        }
        
        function updateProductListButtons() {
            // Update all product buttons to reflect if they're in hero
            const productCards = document.querySelectorAll('#productsList > div');
            productCards.forEach(card => {
                const button = card.querySelector('button');
                if (!button) return;
                
                const productId = parseInt(button.getAttribute('onclick').match(/\d+/)[0]);
                const isInHero = heroProducts.includes(productId);
                const isDisabled = isInHero || heroProducts.length >= 3;
                
                if (isInHero) {
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.className = 'bg-gray-300 cursor-not-allowed text-white px-4 py-2 rounded';
                    button.disabled = true;
                    card.classList.add('bg-orange-50', 'border-orange-300');
                } else {
                    button.innerHTML = '<i class="fas fa-plus"></i>';
                    button.className = isDisabled 
                        ? 'bg-gray-300 cursor-not-allowed text-white px-4 py-2 rounded'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded hover:shadow-lg';
                    button.disabled = isDisabled;
                    card.classList.remove('bg-orange-50', 'border-orange-300');
                }
            });
        }
        
        function saveHeroProducts() {
            if (heroProducts.length > 3) {
                alert('Maximum 3 products allowed in hero section');
                return;
            }
            
            console.log('Saving hero products:', heroProducts);
            
            fetch('../api/admin/hero.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ heroProducts: heroProducts })
            })
            .then(response => {
                console.log('Save response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Save response data:', data);
                if (data.success) {
                    alert('Hero products updated successfully!');
                    location.reload();
                } else {
                    alert('Error: ' + (data.error || 'Failed to update hero products'));
                }
            })
            .catch(error => {
                console.error('Error saving hero products:', error);
                alert('Failed to update hero products: ' + error.message);
            });
        }
        
        function addToHero(productId) {
            productId = parseInt(productId);
            
            if (heroProducts.length >= 3) {
                alert('Maximum 3 products allowed in hero section');
                return;
            }
            
            if (heroProducts.includes(productId)) {
                return;
            }
            
            heroProducts.push(productId);
            updateHeroProductsList();
        }
        
        function removeFromHero(productId) {
            productId = parseInt(productId);
            heroProducts = heroProducts.filter(id => id !== productId);
            updateHeroProductsList();
        }
        
        // Initialize the hero products list on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                updateHeroProductsList();
                initSearch();
            });
        } else {
            // DOM already loaded
            updateHeroProductsList();
            initSearch();
        }
        
        function initSearch() {
            const searchInput = document.getElementById('searchProducts');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const products = document.querySelectorAll('#productsList > div');
                    
                    products.forEach(product => {
                        const text = product.textContent.toLowerCase();
                        product.style.display = text.includes(searchTerm) ? 'block' : 'none';
                    });
                });
            }
        }
    </script>
</body>
</html>

