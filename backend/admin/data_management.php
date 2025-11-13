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

// Get statistics
$stats = [
    'total_orders' => $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
    'total_order_items' => $pdo->query("SELECT COUNT(*) FROM order_items")->fetchColumn(),
    'total_reviews' => $pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn(),
    'blocked_users_count' => 0,
];

// Get blocked users count (handle case where table doesn't exist yet)
try {
    $stats['blocked_users_count'] = $pdo->query("SELECT COUNT(*) FROM blocked_users")->fetchColumn();
} catch (PDOException $e) {
    // Table doesn't exist yet
    error_log('blocked_users table not found: ' . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Management - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto lg:ml-0">
            <!-- Mobile Top Bar -->
            <div class="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                <button onclick="toggleSidebar()" class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <h2 class="text-lg font-bold mt-2">Data Management</h2>
            </div>
            
            <div class="p-4 lg:p-8">
                <div class="flex justify-between items-center mb-4 lg:mb-6">
                    <h2 class="text-2xl lg:text-3xl font-bold hidden lg:block">Data Management</h2>
                </div>

                <?php if ($message): ?>
                    <div class="mb-4 p-4 rounded-lg <?php echo $messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <!-- Warning Banner -->
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                <strong>Warning:</strong> The actions on this page are irreversible. Please proceed with caution.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Orders</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_orders']; ?></p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <i class="fas fa-shopping-cart text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Order Items</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_order_items']; ?></p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <i class="fas fa-box text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Reviews</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['total_reviews']; ?></p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-full">
                                <i class="fas fa-star text-yellow-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Blocked Users</p>
                                <p class="text-3xl font-bold text-gray-800"><?php echo $stats['blocked_users_count']; ?></p>
                            </div>
                            <div class="bg-red-100 p-3 rounded-full">
                                <i class="fas fa-ban text-red-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reset Data Section -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-xl font-bold text-red-600">
                            <i class="fas fa-trash-alt mr-2"></i>Reset All Data
                        </h3>
                        <p class="text-gray-600 text-sm mt-2">This will permanently delete all orders, order items, reviews, and reset all analytics data.</p>
                    </div>
                    <div class="p-6">
                        <button onclick="confirmResetData()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Reset All Order & Analytics Data
                        </button>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-xl font-bold">Quick Actions</h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="orders.php" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-center">
                            <i class="fas fa-shopping-cart mr-2"></i>Manage Orders
                        </a>
                        <a href="users.php" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-center">
                            <i class="fas fa-users mr-2"></i>Manage Users
                        </a>
                        <a href="analytics.php" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg text-center">
                            <i class="fas fa-chart-bar mr-2"></i>View Analytics
                        </a>
                        <a href="index.php" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-center">
                            <i class="fas fa-dashboard mr-2"></i>Business Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirmModal" class="hidden fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-center mb-2" id="modalTitle">Confirm Action</h3>
                <p class="text-gray-600 text-center mb-4" id="modalMessage"></p>
                <div class="flex justify-center space-x-3">
                    <button onclick="closeModal()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                    <button onclick="executeAction()" class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700" id="confirmButton">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let pendingAction = null;

        function confirmResetData() {
            document.getElementById('modalTitle').textContent = 'Reset All Data';
            document.getElementById('modalMessage').textContent = 'Are you absolutely sure? This will permanently delete ALL orders, order items, reviews, and reset all analytics data. This action CANNOT be undone!';
            document.getElementById('confirmButton').textContent = 'Yes, Reset Everything';
            document.getElementById('confirmButton').className = 'px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700';
            pendingAction = 'reset';
            document.getElementById('confirmModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('confirmModal').classList.add('hidden');
            pendingAction = null;
        }

        function executeAction() {
            if (pendingAction === 'reset') {
                // Show loading state
                document.getElementById('confirmButton').disabled = true;
                document.getElementById('confirmButton').textContent = 'Processing...';
                
                fetch('../api/admin/data_management.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'reset_all_data' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '?message=' + encodeURIComponent(data.message) + '&type=success';
                    } else {
                        alert('Error: ' + data.error);
                        closeModal();
                    }
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                    closeModal();
                });
            }
        }

        // Close modal on outside click
        document.getElementById('confirmModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>

