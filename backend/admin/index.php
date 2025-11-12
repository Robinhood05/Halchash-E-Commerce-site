<?php
session_start();
require_once '../config/database.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();

// Get statistics
$stats = [
    'total_products' => $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn(),
    'total_categories' => $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
    'total_users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'total_orders' => $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
    'pending_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
    'processing_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'processing'")->fetchColumn(),
    'delivered_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'delivered'")->fetchColumn(),
    'cancelled_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
    'total_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered'")->fetchColumn(),
    'cancelled_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Halchash</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-gray-800 text-white">
            <div class="p-6">
                <h1 class="text-2xl font-bold">Halchash Admin</h1>
                <p class="text-gray-400 text-sm mt-1">Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?></p>
            </div>
            <nav class="mt-6">
                <a href="index.php" class="block px-6 py-3 bg-gray-700 text-white">
                    <i class="fas fa-dashboard mr-2"></i> Dashboard
                </a>
                <a href="categories.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
                    <i class="fas fa-tags mr-2"></i> Categories
                </a>
                <a href="products.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
                    <i class="fas fa-box mr-2"></i> Products
                </a>
                <a href="orders.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
                    <i class="fas fa-shopping-cart mr-2"></i> Orders
                </a>
                <a href="logout.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto">
            <div class="p-8">
                <h2 class="text-3xl font-bold mb-6">Dashboard</h2>
                
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Products</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_products']; ?></p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <i class="fas fa-box text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Categories</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_categories']; ?></p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <i class="fas fa-tags text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Users</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_users']; ?></p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <i class="fas fa-users text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Sales</p>
                                <p class="text-2xl font-bold text-green-600">৳<?php echo number_format($stats['total_sales'], 2); ?></p>
                                <p class="text-xs text-gray-500 mt-1"><?php echo $stats['delivered_orders']; ?> delivered</p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <i class="fas fa-money-bill-wave text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Statistics -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 class="text-xl font-bold mb-4">Order Statistics</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-yellow-600"><?php echo $stats['pending_orders']; ?></p>
                            <p class="text-sm text-gray-600">Pending</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-blue-600"><?php echo $stats['processing_orders']; ?></p>
                            <p class="text-sm text-gray-600">Confirmed</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-600"><?php echo $stats['delivered_orders']; ?></p>
                            <p class="text-sm text-gray-600">Delivered</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-red-600"><?php echo $stats['cancelled_orders']; ?></p>
                            <p class="text-sm text-gray-600">Cancelled</p>
                            <p class="text-xs text-gray-500">৳<?php echo number_format($stats['cancelled_sales'], 2); ?> lost</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="categories.php" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-center">
                            <i class="fas fa-plus mr-2"></i> Add Category
                        </a>
                        <a href="products.php" class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-center">
                            <i class="fas fa-plus mr-2"></i> Add Product
                        </a>
                        <a href="orders.php" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 text-center">
                            <i class="fas fa-shopping-cart mr-2"></i> Manage Orders
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

