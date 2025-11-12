<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();
$message = $_GET['message'] ?? '';
$messageType = $_GET['type'] ?? 'success';

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $id = intval($_POST['id']);
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $message = 'Product deleted successfully';
    $messageType = 'success';
}

// Get all products
$stmt = $pdo->query("
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.created_at DESC
");
$products = $stmt->fetchAll();

// Get categories for dropdown
$stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
$categories = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto">
            <div class="p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Products</h2>
                    <button onclick="openProductModal()" class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
                        <i class="fas fa-plus mr-2"></i> Add Product
                    </button>
                </div>

                <?php if ($message): ?>
                    <div class="mb-4 p-4 rounded <?php echo $messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <div class="bg-white rounded-lg shadow overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap"><?php echo $product['id']; ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <?php if ($product['image']): ?>
                                            <img src="..<?php echo htmlspecialchars($product['image']); ?>" alt="" class="w-16 h-16 object-cover rounded">
                                        <?php else: ?>
                                            <div class="w-16 h-16 bg-gray-200 rounded"></div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="font-medium"><?php echo htmlspecialchars($product['name']); ?></div>
                                        <?php if ($product['badge']): ?>
                                            <span class="text-xs text-gray-500"><?php echo htmlspecialchars($product['badge']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap"><?php echo htmlspecialchars($product['category_name']); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium">৳<?php echo number_format($product['discount_price'] ?: $product['price'], 2); ?></div>
                                        <?php if ($product['discount_price']): ?>
                                            <div class="text-xs text-gray-500 line-through">৳<?php echo number_format($product['price'], 2); ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded <?php echo $product['in_stock'] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                                            <?php echo $product['in_stock'] ? 'In Stock' : 'Out of Stock'; ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <button onclick="editProduct(<?php echo htmlspecialchars(json_encode($product)); ?>)" class="text-blue-600 hover:text-blue-800 mr-3">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <form method="POST" class="inline" onsubmit="return confirm('Are you sure?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
                                            <button type="submit" class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Product Modal -->
    <div id="productModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-lg p-8 w-full max-w-2xl my-8">
            <h3 class="text-2xl font-bold mb-4" id="modalTitle">Add Product</h3>
            <form id="productForm" method="POST" enctype="multipart/form-data" action="product_save.php">
                <input type="hidden" name="action" id="formAction" value="create">
                <input type="hidden" name="id" id="productId">
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Category *</label>
                        <select name="category_id" id="category_id" required class="w-full px-3 py-2 border rounded">
                            <option value="">Select Category</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?php echo $cat['id']; ?>"><?php echo htmlspecialchars($cat['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Name *</label>
                        <input type="text" name="name" id="name" required class="w-full px-3 py-2 border rounded">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea name="description" id="description" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Price (৳) *</label>
                        <input type="number" step="0.01" name="price" id="price" required class="w-full px-3 py-2 border rounded">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Discount Price (৳)</label>
                        <input type="number" step="0.01" name="discount_price" id="discount_price" class="w-full px-3 py-2 border rounded">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Discount (%)</label>
                        <input type="number" name="discount" id="discount" class="w-full px-3 py-2 border rounded">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
                        <input type="number" name="stock_quantity" id="stock_quantity" value="0" class="w-full px-3 py-2 border rounded">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">Badge</label>
                        <input type="text" name="badge" id="badge" class="w-full px-3 py-2 border rounded" placeholder="Best Seller">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Product Image</label>
                    <input type="file" name="image" id="image" accept="image/*" class="w-full px-3 py-2 border rounded">
                    <div id="imagePreview" class="mt-2"></div>
                    <input type="hidden" name="existing_image" id="existing_image">
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Features (one per line)</label>
                    <textarea name="features_text" id="features_text" class="w-full px-3 py-2 border rounded" rows="3" placeholder="100% Cotton&#10;Handwoven&#10;Traditional Design"></textarea>
                </div>
                
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="in_stock" id="in_stock" checked class="mr-2">
                        <span>In Stock</span>
                    </label>
                </div>
                
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="is_active" id="is_active" checked class="mr-2">
                        <span>Active</span>
                    </label>
                </div>
                
                <div class="flex gap-3">
                    <button type="submit" class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex-1">
                        Save Product
                    </button>
                    <button type="button" onclick="closeProductModal()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function openProductModal() {
            document.getElementById('productModal').classList.remove('hidden');
            document.getElementById('productForm').reset();
            document.getElementById('modalTitle').textContent = 'Add Product';
            document.getElementById('formAction').value = 'create';
            document.getElementById('imagePreview').innerHTML = '';
        }
        
        function closeProductModal() {
            document.getElementById('productModal').classList.add('hidden');
        }
        
        function editProduct(product) {
            document.getElementById('productModal').classList.remove('hidden');
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('formAction').value = 'update';
            document.getElementById('productId').value = product.id;
            document.getElementById('category_id').value = product.category_id;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description || '';
            document.getElementById('price').value = product.price;
            document.getElementById('discount_price').value = product.discount_price || '';
            document.getElementById('discount').value = product.discount || '';
            document.getElementById('stock_quantity').value = product.stock_quantity || 0;
            document.getElementById('badge').value = product.badge || '';
            document.getElementById('in_stock').checked = product.in_stock == 1;
            document.getElementById('is_active').checked = product.is_active == 1;
            document.getElementById('existing_image').value = product.image || '';
            
            const features = product.features ? JSON.parse(product.features) : [];
            document.getElementById('features_text').value = features.join('\n');
            
            if (product.image) {
                document.getElementById('imagePreview').innerHTML = `<img src="../${product.image}" class="w-32 h-32 object-cover rounded mt-2">`;
            }
        }
    </script>
</body>
</html>

