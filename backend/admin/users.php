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

// Get all users
$stmt = $pdo->query("SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC");
$users = $stmt->fetchAll();

// Get blocked phone numbers (handle case where table doesn't exist yet)
$blockedPhones = [];
try {
    $blockedStmt = $pdo->query("SELECT phone FROM blocked_users");
    while ($row = $blockedStmt->fetch()) {
        $blockedPhones[] = preg_replace('/[^0-9+]/', '', $row['phone']);
    }
} catch (PDOException $e) {
    // Table doesn't exist yet, will be created when migration is run
    error_log('blocked_users table not found: ' . $e->getMessage());
}

// Check which users are blocked
foreach ($users as &$user) {
    $userPhone = $user['phone'] ? preg_replace('/[^0-9+]/', '', $user['phone']) : '';
    $user['is_blocked'] = in_array($userPhone, $blockedPhones);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Management - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto lg:ml-0">
            <!-- Mobile Top Bar -->
            <div class="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                <button onclick="toggleSidebar()" class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <h2 class="text-lg font-bold mt-2">Users Management</h2>
            </div>
            
            <div class="p-4 lg:p-8">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-4">
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-800 hidden lg:block">Users Management</h2>
                    <div class="text-sm text-gray-600">
                        Total Users: <span class="font-semibold"><?php echo count($users); ?></span>
                    </div>
                </div>

                <?php if ($message): ?>
                    <div class="mb-4 p-4 rounded-lg <?php echo $messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <!-- Desktop Table View -->
                <div class="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php if (empty($users)): ?>
                                    <tr>
                                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">No users found</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($users as $user): ?>
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo $user['id']; ?></td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($user['name']); ?></div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm text-gray-900"><?php echo htmlspecialchars($user['email']); ?></div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm text-gray-900"><?php echo htmlspecialchars($user['phone'] ?? 'N/A'); ?></div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <?php if ($user['is_blocked']): ?>
                                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        <i class="fas fa-ban mr-1"></i>Blocked
                                                    </span>
                                                <?php else: ?>
                                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        <i class="fas fa-check-circle mr-1"></i>Active
                                                    </span>
                                                <?php endif; ?>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="text-sm text-gray-900 max-w-xs truncate" title="<?php echo htmlspecialchars($user['address'] ?? 'N/A'); ?>">
                                                    <?php echo htmlspecialchars($user['address'] ?? 'N/A'); ?>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <?php echo date('M d, Y', strtotime($user['created_at'])); ?>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <?php if ($user['phone']): ?>
                                                    <?php if ($user['is_blocked']): ?>
                                                        <button onclick="unblockUser('<?php echo htmlspecialchars($user['phone']); ?>')" class="text-green-600 hover:text-green-900">
                                                            <i class="fas fa-unlock mr-1"></i>Unblock
                                                        </button>
                                                    <?php else: ?>
                                                        <button onclick="blockUser('<?php echo htmlspecialchars($user['phone']); ?>', '<?php echo htmlspecialchars($user['name']); ?>')" class="text-red-600 hover:text-red-900">
                                                            <i class="fas fa-ban mr-1"></i>Block
                                                        </button>
                                                    <?php endif; ?>
                                                <?php else: ?>
                                                    <span class="text-gray-400">No phone</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Mobile Card View -->
                <div class="lg:hidden space-y-4">
                    <?php if (empty($users)): ?>
                        <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">No users found</div>
                    <?php else: ?>
                        <?php foreach ($users as $user): ?>
                            <div class="bg-white rounded-lg shadow p-4">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex-1">
                                        <p class="text-xs text-gray-500">ID: <?php echo $user['id']; ?></p>
                                        <h3 class="text-base font-semibold text-gray-900 mt-1"><?php echo htmlspecialchars($user['name']); ?></h3>
                                        <p class="text-sm text-gray-600 mt-1 break-all"><?php echo htmlspecialchars($user['email']); ?></p>
                                    </div>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center">
                                        <i class="fas fa-phone text-gray-400 mr-2 w-4"></i>
                                        <span class="text-gray-700"><?php echo htmlspecialchars($user['phone'] ?? 'N/A'); ?></span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="fas fa-info-circle text-gray-400 mr-2 w-4"></i>
                                        <?php if ($user['is_blocked']): ?>
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                <i class="fas fa-ban mr-1"></i>Blocked
                                            </span>
                                        <?php else: ?>
                                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                <i class="fas fa-check-circle mr-1"></i>Active
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="flex items-start">
                                        <i class="fas fa-map-marker-alt text-gray-400 mr-2 w-4 mt-1"></i>
                                        <span class="text-gray-700 flex-1"><?php echo htmlspecialchars($user['address'] ?? 'N/A'); ?></span>
                                    </div>
                                    <div class="flex items-center">
                                        <i class="fas fa-calendar text-gray-400 mr-2 w-4"></i>
                                        <span class="text-gray-700"><?php echo date('M d, Y', strtotime($user['created_at'])); ?></span>
                                    </div>
                                    <?php if ($user['phone']): ?>
                                        <div class="pt-2 border-t">
                                            <?php if ($user['is_blocked']): ?>
                                                <button onclick="unblockUser('<?php echo htmlspecialchars($user['phone']); ?>')" class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                                                    <i class="fas fa-unlock mr-1"></i>Unblock User
                                                </button>
                                            <?php else: ?>
                                                <button onclick="blockUser('<?php echo htmlspecialchars($user['phone']); ?>', '<?php echo htmlspecialchars($user['name']); ?>')" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">
                                                    <i class="fas fa-ban mr-1"></i>Block User
                                                </button>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Block User Modal -->
    <div id="blockModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Block User</h3>
                    <button onclick="closeBlockModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="blockForm" onsubmit="submitBlock(event)">
                    <input type="hidden" id="blockPhone" name="phone">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">User</label>
                        <div id="blockUserName" class="px-3 py-2 bg-gray-100 rounded"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div id="blockPhoneDisplay" class="px-3 py-2 bg-gray-100 rounded"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                        <textarea id="blockReason" name="reason" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Enter reason for blocking..."></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="closeBlockModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            <i class="fas fa-ban mr-1"></i>Block User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        function blockUser(phone, name) {
            document.getElementById('blockPhone').value = phone;
            document.getElementById('blockPhoneDisplay').textContent = phone;
            document.getElementById('blockUserName').textContent = name;
            document.getElementById('blockReason').value = '';
            document.getElementById('blockModal').classList.remove('hidden');
        }

        function closeBlockModal() {
            document.getElementById('blockModal').classList.add('hidden');
            document.getElementById('blockForm').reset();
        }

        function submitBlock(event) {
            event.preventDefault();
            const phone = document.getElementById('blockPhone').value;
            const reason = document.getElementById('blockReason').value;

            fetch('../api/admin/blocked_users.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: phone, reason: reason })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '?message=' + encodeURIComponent('User blocked successfully') + '&type=success';
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
        }

        function unblockUser(phone) {
            if (!confirm('Are you sure you want to unblock this user? They will be able to place orders again.')) {
                return;
            }

            fetch('../api/admin/blocked_users.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: phone })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '?message=' + encodeURIComponent('User unblocked successfully') + '&type=success';
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
        }
    </script>
</body>
</html>

