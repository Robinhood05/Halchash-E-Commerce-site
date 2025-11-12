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

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'create':
                $name = sanitizeInput($_POST['name']);
                $icon = sanitizeInput($_POST['icon']);
                $description = sanitizeInput($_POST['description']);
                $color = sanitizeInput($_POST['color']);
                
                if (!empty($name)) {
                    $slug = generateSlug($name);
                    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
                    $stmt->execute([$slug]);
                    if ($stmt->fetch()) {
                        $slug = $slug . '-' . time();
                    }
                    
                    $stmt = $pdo->prepare("INSERT INTO categories (name, slug, icon, description, color) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $slug, $icon, $description, $color]);
                    $message = 'Category created successfully';
                    $messageType = 'success';
                }
                break;
                
            case 'update':
                $id = intval($_POST['id']);
                $name = sanitizeInput($_POST['name']);
                $icon = sanitizeInput($_POST['icon']);
                $description = sanitizeInput($_POST['description']);
                $color = sanitizeInput($_POST['color']);
                $is_active = isset($_POST['is_active']) ? 1 : 0;
                
                $slug = generateSlug($name);
                $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ? AND id != ?");
                $stmt->execute([$slug, $id]);
                if ($stmt->fetch()) {
                    $slug = $slug . '-' . $id;
                }
                
                $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, icon = ?, description = ?, color = ?, is_active = ? WHERE id = ?");
                $stmt->execute([$name, $slug, $icon, $description, $color, $is_active, $id]);
                $message = 'Category updated successfully';
                $messageType = 'success';
                break;
                
            case 'delete':
                $id = intval($_POST['id']);
                $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                
                if ($result['count'] > 0) {
                    $message = 'Cannot delete category with existing products';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
                    $stmt->execute([$id]);
                    $message = 'Category deleted successfully';
                    $messageType = 'success';
                }
                break;
        }
    }
}

// Get all categories
$stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
$categories = $stmt->fetchAll();

// Get category for editing
$editCategory = null;
if (isset($_GET['edit'])) {
    $id = intval($_GET['edit']);
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $editCategory = $stmt->fetch();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categories - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto">
            <div class="p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Categories</h2>
                    <button onclick="document.getElementById('categoryModal').classList.remove('hidden')" class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
                        <i class="fas fa-plus mr-2"></i> Add Category
                    </button>
                </div>

                <?php if ($message): ?>
                    <div class="mb-4 p-4 rounded <?php echo $messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php foreach ($categories as $cat): ?>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap"><?php echo $cat['id']; ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-2xl"><?php echo htmlspecialchars($cat['icon']); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap font-medium"><?php echo htmlspecialchars($cat['name']); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-gray-500"><?php echo htmlspecialchars($cat['slug']); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded <?php echo $cat['is_active'] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                                            <?php echo $cat['is_active'] ? 'Active' : 'Inactive'; ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <a href="?edit=<?php echo $cat['id']; ?>" class="text-blue-600 hover:text-blue-800 mr-3">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form method="POST" class="inline" onsubmit="return confirm('Are you sure?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $cat['id']; ?>">
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

    <!-- Category Modal -->
    <div id="categoryModal" class="<?php echo $editCategory ? '' : 'hidden'; ?> fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 class="text-2xl font-bold mb-4"><?php echo $editCategory ? 'Edit' : 'Add'; ?> Category</h3>
            <form method="POST">
                <input type="hidden" name="action" value="<?php echo $editCategory ? 'update' : 'create'; ?>">
                <?php if ($editCategory): ?>
                    <input type="hidden" name="id" value="<?php echo $editCategory['id']; ?>">
                <?php endif; ?>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Name *</label>
                    <input type="text" name="name" required value="<?php echo $editCategory ? htmlspecialchars($editCategory['name']) : ''; ?>" class="w-full px-3 py-2 border rounded">
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Icon (Emoji)</label>
                    <input type="text" name="icon" value="<?php echo $editCategory ? htmlspecialchars($editCategory['icon']) : ''; ?>" class="w-full px-3 py-2 border rounded" placeholder="👗">
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea name="description" class="w-full px-3 py-2 border rounded" rows="3"><?php echo $editCategory ? htmlspecialchars($editCategory['description']) : ''; ?></textarea>
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Color Class</label>
                    <input type="text" name="color" value="<?php echo $editCategory ? htmlspecialchars($editCategory['color']) : ''; ?>" class="w-full px-3 py-2 border rounded" placeholder="bg-purple-100 text-purple-800">
                </div>
                
                <?php if ($editCategory): ?>
                    <div class="mb-4">
                        <label class="flex items-center">
                            <input type="checkbox" name="is_active" <?php echo $editCategory['is_active'] ? 'checked' : ''; ?> class="mr-2">
                            <span>Active</span>
                        </label>
                    </div>
                <?php endif; ?>
                
                <div class="flex gap-3">
                    <button type="submit" class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex-1">
                        <?php echo $editCategory ? 'Update' : 'Create'; ?>
                    </button>
                    <button type="button" onclick="window.location.href='categories.php'" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>

