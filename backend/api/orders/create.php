<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$customer = $data['customer'] ?? [];
$items = $data['items'] ?? [];
$totals = $data['totals'] ?? [];
$userId = isset($data['user_id']) ? intval($data['user_id']) : null;

$requiredCustomer = ['name', 'email', 'phone', 'address'];
foreach ($requiredCustomer as $field) {
    if (empty($customer[$field])) {
        sendJSONResponse(['success' => false, 'error' => "Missing customer field: {$field}"]);
    }
}

if (empty($items) || !is_array($items)) {
    sendJSONResponse(['success' => false, 'error' => 'Cart items are required']);
}

if (empty($totals['subtotal']) || empty($totals['total'])) {
    sendJSONResponse(['success' => false, 'error' => 'Order totals are required']);
}

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();

    // If user_id not provided try to find by email or create account
    $accountCreated = false;
    $temporaryPassword = null;

    if (!$userId) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$customer['email']]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            $userId = (int)$existingUser['id'];
        } else {
            // Create account with random password
            $temporaryPassword = substr(bin2hex(random_bytes(8)), 0, 12);
            $hashedPassword = password_hash($temporaryPassword, PASSWORD_DEFAULT);
            $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($customer['name']) . '&background=059669&color=fff';

            $stmt = $pdo->prepare('INSERT INTO users (name, email, password, phone, address, avatar) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $customer['name'],
                $customer['email'],
                $hashedPassword,
                $customer['phone'],
                $customer['address'],
                $avatar
            ]);

            $userId = (int)$pdo->lastInsertId();
            $accountCreated = true;
        }
    }

    // Generate order number
    $orderNumber = 'HAL-' . strtoupper(dechex(time())) . '-' . substr(strtoupper(bin2hex(random_bytes(3))), 0, 6);

    $shippingCost = isset($totals['shipping']) ? (float)$totals['shipping'] : 50.00;

    // Insert order
    $stmt = $pdo->prepare('INSERT INTO orders (user_id, order_number, total_amount, shipping_cost, status, shipping_name, shipping_email, shipping_phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $userId,
        $orderNumber,
        (float)$totals['total'],
        $shippingCost,
        'pending',
        $customer['name'],
        $customer['email'],
        $customer['phone'],
        $customer['address']
    ]);

    $orderId = (int)$pdo->lastInsertId();

    // Insert order items
    $insertItem = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)');

    foreach ($items as $item) {
        $productId = isset($item['id']) ? (int)$item['id'] : null;
        $productName = sanitizeInput($item['name'] ?? '');
        $productPrice = isset($item['price']) ? (float)$item['price'] : 0;
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
        $subtotal = $productPrice * $quantity;

        if (empty($productName) || $productPrice <= 0) {
            $pdo->rollBack();
            sendJSONResponse(['success' => false, 'error' => 'Invalid product data provided']);
        }

        // Validate product_id exists if provided
        if ($productId) {
            $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
            $stmt->execute([$productId]);
            if (!$stmt->fetch()) {
                $productId = null; // Product not found, store as null
            }
        }

        $insertItem->execute([
            $orderId,
            $productId,
            $productName,
            $productPrice,
            $quantity,
            $subtotal
        ]);
    }

    $pdo->commit();

    $response = [
        'success' => true,
        'message' => 'Order placed successfully',
        'order' => [
            'id' => $orderId,
            'order_number' => $orderNumber,
            'total' => (float)$totals['total'],
            'subtotal' => (float)$totals['subtotal'],
            'shipping_cost' => $shippingCost,
            'status' => 'pending'
        ]
    ];

    if ($accountCreated) {
        $response['account_created'] = true;
        $response['temporary_password'] = $temporaryPassword;
        $response['user_id'] = $userId;
    } else {
        $response['user_id'] = $userId;
    }

    sendJSONResponse($response);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Order creation error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to place order'], 500);
}
?>
