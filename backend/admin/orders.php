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

// Get filter
$filter = $_GET['filter'] ?? 'all';

// Build query based on filter
$whereClause = '';
if ($filter === 'pending') {
    $whereClause = "WHERE status = 'pending'";
} elseif ($filter === 'processing') {
    $whereClause = "WHERE status = 'processing'";
} elseif ($filter === 'delivered') {
    $whereClause = "WHERE status = 'delivered'";
} elseif ($filter === 'cancelled') {
    $whereClause = "WHERE status = 'cancelled'";
}

// Get all orders with items count
$query = "
    SELECT o.*, 
           COUNT(oi.id) as items_count,
           SUM(oi.subtotal) as items_total
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    $whereClause
    GROUP BY o.id
    ORDER BY o.created_at DESC
";
$stmt = $pdo->query($query);
$orders = $stmt->fetchAll();

// Get statistics
$stats = [
    'total_orders' => $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
    'pending_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
    'processing_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'processing'")->fetchColumn(),
    'delivered_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'delivered'")->fetchColumn(),
    'cancelled_orders' => $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
    'total_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered'")->fetchColumn(),
    'cancelled_sales' => $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'cancelled'")->fetchColumn(),
];

function getStatusBadge($status) {
    $badges = [
        'pending' => 'bg-yellow-100 text-yellow-800',
        'processing' => 'bg-blue-100 text-blue-800',
        'shipped' => 'bg-purple-100 text-purple-800',
        'delivered' => 'bg-green-100 text-green-800',
        'cancelled' => 'bg-red-100 text-red-800'
    ];
    return $badges[$status] ?? 'bg-gray-100 text-gray-800';
}

function getStatusLabel($status) {
    $labels = [
        'pending' => 'Pending',
        'processing' => 'Confirmed',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled'
    ];
    return $labels[$status] ?? ucfirst($status);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders Management - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto">
            <div class="p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold">Orders Management</h2>
                </div>

                <?php if ($message): ?>
                    <div class="mb-4 p-4 rounded-lg <?php echo $messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Sales</p>
                                <p class="text-2xl font-bold text-green-600">৳<?php echo number_format($stats['total_sales'], 2); ?></p>
                                <p class="text-xs text-gray-500 mt-1">From <?php echo $stats['delivered_orders']; ?> delivered orders</p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <i class="fas fa-money-bill-wave text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Pending Orders</p>
                                <p class="text-3xl font-bold text-yellow-600"><?php echo $stats['pending_orders']; ?></p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-full">
                                <i class="fas fa-clock text-yellow-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Confirmed Orders</p>
                                <p class="text-3xl font-bold text-blue-600"><?php echo $stats['processing_orders']; ?></p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <i class="fas fa-check-circle text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Cancelled Orders</p>
                                <p class="text-3xl font-bold text-red-600"><?php echo $stats['cancelled_orders']; ?></p>
                                <p class="text-xs text-gray-500 mt-1">৳<?php echo number_format($stats['cancelled_sales'], 2); ?> lost</p>
                            </div>
                            <div class="bg-red-100 p-3 rounded-full">
                                <i class="fas fa-times-circle text-red-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="flex border-b">
                        <a href="?filter=all" class="px-6 py-3 <?php echo $filter === 'all' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'; ?>">
                            All Orders (<?php echo $stats['total_orders']; ?>)
                        </a>
                        <a href="?filter=pending" class="px-6 py-3 <?php echo $filter === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600 font-semibold' : 'text-gray-600 hover:text-gray-800'; ?>">
                            Pending (<?php echo $stats['pending_orders']; ?>)
                        </a>
                        <a href="?filter=processing" class="px-6 py-3 <?php echo $filter === 'processing' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'; ?>">
                            Confirmed (<?php echo $stats['processing_orders']; ?>)
                        </a>
                        <a href="?filter=delivered" class="px-6 py-3 <?php echo $filter === 'delivered' ? 'border-b-2 border-green-500 text-green-600 font-semibold' : 'text-gray-600 hover:text-gray-800'; ?>">
                            Delivered (<?php echo $stats['delivered_orders']; ?>)
                        </a>
                        <a href="?filter=cancelled" class="px-6 py-3 <?php echo $filter === 'cancelled' ? 'border-b-2 border-red-500 text-red-600 font-semibold' : 'text-gray-600 hover:text-gray-800'; ?>">
                            Cancelled (<?php echo $stats['cancelled_orders']; ?>)
                        </a>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php if (empty($orders)): ?>
                                    <tr>
                                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">No orders found</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($orders as $order): ?>
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-medium text-gray-900">#<?php echo htmlspecialchars($order['order_number']); ?></div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="text-sm text-gray-900"><?php echo htmlspecialchars($order['shipping_name']); ?></div>
                                                <div class="text-sm text-gray-500"><?php echo htmlspecialchars($order['shipping_email']); ?></div>
                                                <div class="text-sm text-gray-500"><?php echo htmlspecialchars($order['shipping_phone']); ?></div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm text-gray-900"><?php echo $order['items_count']; ?> items</div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-semibold text-gray-900">৳<?php echo number_format($order['total_amount'], 2); ?></div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 py-1 text-xs font-semibold rounded-full <?php echo getStatusBadge($order['status']); ?>">
                                                    <?php echo getStatusLabel($order['status']); ?>
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <?php echo date('M d, Y h:i A', strtotime($order['created_at'])); ?>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onclick="viewOrder(<?php echo $order['id']; ?>)" class="text-blue-600 hover:text-blue-900 mr-3">
                                                    <i class="fas fa-eye"></i> View
                                                </button>
                                                <button onclick="changeStatus(<?php echo $order['id']; ?>, '<?php echo $order['status']; ?>')" class="text-green-600 hover:text-green-900">
                                                    <i class="fas fa-edit"></i> Change Status
                                                </button>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Image View Modal -->
    <div id="imageModal" class="hidden fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative max-w-4xl w-full">
                <button onclick="closeImageModal()" class="absolute top-4 right-4 z-10 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200">
                    <i class="fas fa-times"></i>
                </button>
                <img id="modalImage" src="" alt="Product Image" class="w-full h-auto rounded-lg shadow-2xl">
                <div id="imageNavigation" class="hidden mt-4 flex justify-center space-x-2">
                    <button onclick="previousImage()" class="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <span id="imageCounter" class="bg-white text-gray-800 px-4 py-2 rounded"></span>
                    <button onclick="nextImage()" class="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Order Details Modal -->
    <div id="orderModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div class="mt-3">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Order Details</h3>
                    <button onclick="closeOrderModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="orderDetails" class="space-y-4">
                    <!-- Order details will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Status Change Modal -->
    <div id="statusModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-bold mb-4">Change Order Status</h3>
                <form id="statusForm" onsubmit="updateStatus(event)">
                    <input type="hidden" id="orderId" name="orderId">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                        <div id="currentStatus" class="px-3 py-2 bg-gray-100 rounded"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                        <select id="newStatus" name="status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="closeStatusModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        function viewOrder(orderId) {
            fetch(`../api/admin/orders.php?id=${orderId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const order = data.order;
                        let html = `
                            <div class="border-b pb-4 mb-4">
                                <h4 class="font-semibold">Order #${order.order_number}</h4>
                                <p class="text-sm text-gray-600">Date: ${new Date(order.created_at).toLocaleString()}</p>
                                <p class="text-sm text-gray-600">Status: <span class="px-2 py-1 rounded ${getStatusBadgeClass(order.status)}">${getStatusLabel(order.status)}</span></p>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h5 class="font-semibold mb-2">Shipping Information</h5>
                                    <p class="text-sm">${order.shipping_name}</p>
                                    <p class="text-sm text-gray-600">${order.shipping_email}</p>
                                    <p class="text-sm text-gray-600">${order.shipping_phone}</p>
                                    <p class="text-sm text-gray-600">${order.shipping_address}</p>
                                </div>
                                <div>
                                    <h5 class="font-semibold mb-2">Order Summary</h5>
                                    <p class="text-sm">Subtotal: ৳${parseFloat(order.total_amount - order.shipping_cost).toFixed(2)}</p>
                                    <p class="text-sm">Shipping: ৳${parseFloat(order.shipping_cost).toFixed(2)}</p>
                                    <p class="text-sm font-semibold">Total: ৳${parseFloat(order.total_amount).toFixed(2)}</p>
                                </div>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">Order Items</h5>
                                <div class="space-y-4">
                        `;
                        order.items.forEach((item, index) => {
                            const productImage = item.product_image || (item.product_images && item.product_images.length > 0 ? item.product_images[0] : '');
                            const imageUrl = productImage ? (productImage.startsWith('http') ? productImage : '../' + productImage) : 'https://placehold.co/200x200?text=No+Image';
                            const allImages = item.product_images && item.product_images.length > 0 
                                ? item.product_images 
                                : (productImage ? [productImage] : []);
                            
                            html += `
                                <div class="border rounded-lg p-4 flex items-start space-x-4">
                                    <div class="flex-shrink-0">
                                        <img 
                                            src="${imageUrl}" 
                                            alt="${item.product_name}"
                                            class="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                            onclick="viewProductImage(${index})"
                                            data-images='${JSON.stringify(allImages)}'
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <h6 class="font-semibold text-gray-900">${item.product_name}</h6>
                                        <p class="text-sm text-gray-600">Price: ৳${parseFloat(item.product_price).toFixed(2)}</p>
                                        <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                                        <p class="text-sm font-semibold text-gray-900">Subtotal: ৳${parseFloat(item.subtotal).toFixed(2)}</p>
                                    </div>
                                </div>
                            `;
                        });
                        html += `</div></div>`;
                        document.getElementById('orderDetails').innerHTML = html;
                        document.getElementById('orderModal').classList.remove('hidden');
                    }
                });
        }

        function closeOrderModal() {
            document.getElementById('orderModal').classList.add('hidden');
        }

        function changeStatus(orderId, currentStatus) {
            document.getElementById('orderId').value = orderId;
            document.getElementById('currentStatus').innerHTML = `<span class="px-2 py-1 rounded ${getStatusBadgeClass(currentStatus)}">${getStatusLabel(currentStatus)}</span>`;
            document.getElementById('statusModal').classList.remove('hidden');
        }

        function closeStatusModal() {
            document.getElementById('statusModal').classList.add('hidden');
            document.getElementById('statusForm').reset();
        }

        function updateStatus(event) {
            event.preventDefault();
            const orderId = document.getElementById('orderId').value;
            const status = document.getElementById('newStatus').value;

            fetch('../api/admin/orders.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: orderId, status: status })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '?message=' + encodeURIComponent('Order status updated successfully') + '&type=success';
                } else {
                    alert('Error: ' + data.error);
                }
            });
        }

        function getStatusBadgeClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'processing': 'bg-blue-100 text-blue-800',
                'shipped': 'bg-purple-100 text-purple-800',
                'delivered': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }

        function getStatusLabel(status) {
            const labels = {
                'pending': 'Pending',
                'processing': 'Confirmed',
                'shipped': 'Shipped',
                'delivered': 'Delivered',
                'cancelled': 'Cancelled'
            };
            return labels[status] || status;
        }

        // Image viewing functionality
        let currentImages = [];
        let currentImageIndex = 0;

        function viewProductImage(index) {
            const clickedImg = event.target;
            const imagesData = clickedImg.getAttribute('data-images');
            const images = imagesData ? JSON.parse(imagesData) : [];
            
            currentImages = images.length > 0 ? images : [clickedImg.src];
            currentImageIndex = 0;
            
            const modalImage = document.getElementById('modalImage');
            const imageNavigation = document.getElementById('imageNavigation');
            const imageCounter = document.getElementById('imageCounter');
            
            const firstImage = currentImages[0];
            modalImage.src = firstImage.startsWith('http') ? firstImage : '../' + firstImage;
            
            if (currentImages.length > 1) {
                imageNavigation.classList.remove('hidden');
                imageCounter.textContent = `1 / ${currentImages.length}`;
            } else {
                imageNavigation.classList.add('hidden');
            }
            
            document.getElementById('imageModal').classList.remove('hidden');
        }

        function closeImageModal() {
            document.getElementById('imageModal').classList.add('hidden');
            currentImages = [];
            currentImageIndex = 0;
        }

        function nextImage() {
            if (currentImages.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                updateImageDisplay();
            }
        }

        function previousImage() {
            if (currentImages.length > 0) {
                currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                updateImageDisplay();
            }
        }

        function updateImageDisplay() {
            const modalImage = document.getElementById('modalImage');
            const imageCounter = document.getElementById('imageCounter');
            
            const imageUrl = currentImages[currentImageIndex];
            modalImage.src = imageUrl.startsWith('http') ? imageUrl : '../' + imageUrl;
            imageCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
        }

        // Keyboard navigation for images
        document.addEventListener('keydown', function(e) {
            const imageModal = document.getElementById('imageModal');
            if (!imageModal.classList.contains('hidden')) {
                if (e.key === 'ArrowRight') {
                    nextImage();
                } else if (e.key === 'ArrowLeft') {
                    previousImage();
                } else if (e.key === 'Escape') {
                    closeImageModal();
                }
            }
        });
    </script>
</body>
</html>

