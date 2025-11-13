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
    <title>Business Dashboard - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto bg-gray-50 lg:ml-0">
            <!-- Top Navigation Bar -->
            <div class="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 lg:space-x-4">
                        <button onclick="toggleSidebar()" class="lg:hidden text-gray-600 hover:text-gray-800">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                        <h1 class="text-lg lg:text-2xl font-bold text-gray-800">Dashboard</h1>
                    </div>
                    <div class="flex items-center space-x-2 lg:space-x-4">
                        <div class="relative hidden md:block">
                            <input type="text" placeholder="Search..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm lg:text-base w-40 lg:w-auto">
                            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>
                        <div class="relative">
                            <button class="text-gray-600 hover:text-gray-800 relative">
                                <i class="fas fa-bell text-lg lg:text-xl"></i>
                                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">21</span>
                            </button>
                        </div>
                        <div class="flex items-center space-x-1 lg:space-x-2">
                            <div class="w-8 h-8 lg:w-10 lg:h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                                <?php echo strtoupper(substr($_SESSION['admin_username'], 0, 1)); ?>
                            </div>
                            <span class="text-gray-700 font-medium text-sm lg:text-base hidden sm:block"><?php echo htmlspecialchars($_SESSION['admin_username']); ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 lg:p-8">
                
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Sales Of This Year</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">৳<?php echo number_format($stats['total_sales'], 0); ?></p>
                            </div>
                            <div class="relative">
                                <i class="fas fa-ellipsis-v text-gray-400 cursor-pointer"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm">
                            <span class="text-green-600 font-semibold"><?php echo $stats['delivered_orders'] > 0 ? round(($stats['delivered_orders'] / $stats['total_orders']) * 100) : 0; ?>% ↑</span>
                            <span class="text-gray-500 ml-2">vs last year</span>
                        </div>
                        <div class="mt-4 h-16 bg-gradient-to-t from-pink-100 to-pink-50 rounded opacity-60"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Orders</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1"><?php echo $stats['total_orders']; ?></p>
                            </div>
                            <div class="relative">
                                <i class="fas fa-ellipsis-v text-gray-400 cursor-pointer"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm">
                            <span class="text-red-600 font-semibold"><?php echo $stats['cancelled_orders'] > 0 ? round(($stats['cancelled_orders'] / $stats['total_orders']) * 100) : 0; ?>% ↓</span>
                            <span class="text-gray-500 ml-2">cancelled</span>
                        </div>
                        <div class="mt-4 h-16 bg-gradient-to-t from-green-100 to-green-50 rounded opacity-60"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Total Profit</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">
                                    <?php 
                                    $totalProfit = $pdo->query("
                                        SELECT COALESCE(SUM((oi.product_price - COALESCE(oi.buying_price, 0)) * oi.quantity), 0) as total_profit
                                        FROM orders o
                                        INNER JOIN order_items oi ON o.id = oi.order_id
                                        WHERE o.status = 'delivered'
                                    ")->fetchColumn();
                                    echo '৳' . number_format($totalProfit, 0);
                                    ?>
                                </p>
                            </div>
                            <div class="relative">
                                <i class="fas fa-ellipsis-v text-gray-400 cursor-pointer"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm">
                            <span class="text-purple-600 font-semibold"><?php echo $stats['delivered_orders'] > 0 ? round(($stats['delivered_orders'] / $stats['total_orders']) * 100) : 0; ?>% ↑</span>
                            <span class="text-gray-500 ml-2">delivered</span>
                        </div>
                        <div class="mt-4 h-16 bg-gradient-to-t from-purple-100 to-purple-50 rounded opacity-60"></div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-gray-500 text-sm font-medium">Revenue Of This Year</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">৳<?php echo number_format($stats['total_sales'], 0); ?></p>
                            </div>
                            <div class="relative">
                                <i class="fas fa-ellipsis-v text-gray-400 cursor-pointer"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm">
                            <span class="text-blue-600 font-semibold"><?php echo $stats['delivered_orders'] > 0 ? round(($stats['delivered_orders'] / $stats['total_orders']) * 100) : 0; ?>% ↑</span>
                            <span class="text-gray-500 ml-2">growth</span>
                        </div>
                        <div class="mt-4 h-16 bg-gradient-to-t from-blue-100 to-blue-50 rounded opacity-60"></div>
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

