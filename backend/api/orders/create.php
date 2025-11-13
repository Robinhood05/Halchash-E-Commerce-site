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
    
    // Check if phone number is blocked (handle case where table doesn't exist yet)
    try {
        $phone = preg_replace('/[^0-9+]/', '', $customer['phone']);
        $stmt = $pdo->prepare('SELECT id FROM blocked_users WHERE phone = ?');
        $stmt->execute([$phone]);
        $blocked = $stmt->fetch();
        
        if ($blocked) {
            sendJSONResponse(['success' => false, 'error' => 'This phone number is blocked and cannot place orders. Please contact support.'], 403);
        }
    } catch (PDOException $e) {
        // Table doesn't exist yet, skip blocking check
        error_log('blocked_users table not found: ' . $e->getMessage());
    }
    
    $pdo->beginTransaction();

    // If user_id not provided try to find by email or create account
    $accountCreated = false;
    $temporaryPassword = null;

    if (!$userId) {
        // Normalize email to lowercase
        $emailLower = strtolower(trim($customer['email']));
        
        // Check if user exists by email
        $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(email) = ?');
        $stmt->execute([$emailLower]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            $userId = (int)$existingUser['id'];
        } else {
            // Normalize phone: trim and set to NULL if empty
            $phone = !empty(trim($customer['phone'])) ? trim($customer['phone']) : null;
            
            // Check if phone number already exists (only if phone is provided)
            if ($phone !== null) {
                $stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
                $stmt->execute([$phone]);
                $existingPhoneUser = $stmt->fetch();
                if ($existingPhoneUser) {
                    $pdo->rollBack();
                    sendJSONResponse(['success' => false, 'error' => 'Phone number already registered. Please login or use a different phone number.']);
                }
            }
            
            // Create account with random password
            $temporaryPassword = substr(bin2hex(random_bytes(8)), 0, 12);
            $hashedPassword = password_hash($temporaryPassword, PASSWORD_DEFAULT);
            $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($customer['name']) . '&background=059669&color=fff';

            $stmt = $pdo->prepare('INSERT INTO users (name, email, password, phone, address, avatar) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $customer['name'],
                $emailLower,
                $hashedPassword,
                $phone,
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
    $insertItem = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_price, buying_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)');

    foreach ($items as $item) {
        $productId = isset($item['id']) ? (int)$item['id'] : null;
        $productName = sanitizeInput($item['name'] ?? '');
        $productPrice = isset($item['price']) ? (float)$item['price'] : 0;
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
        $subtotal = $productPrice * $quantity;
        $buyingPrice = 0.00;

        if (empty($productName) || $productPrice <= 0) {
            $pdo->rollBack();
            sendJSONResponse(['success' => false, 'error' => 'Invalid product data provided']);
        }

        // Get buying_price from product if product_id exists
        if ($productId) {
            $stmt = $pdo->prepare('SELECT id, buying_price FROM products WHERE id = ?');
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            if ($product) {
                $buyingPrice = isset($product['buying_price']) ? (float)$product['buying_price'] : 0.00;
            } else {
                $productId = null; // Product not found, store as null
            }
        }

        $insertItem->execute([
            $orderId,
            $productId,
            $productName,
            $productPrice,
            $buyingPrice,
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

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Order creation error: ' . $e->getMessage());
    
    // Handle unique constraint violations
    $errorInfo = $e->errorInfo();
    $sqlState = $errorInfo[0] ?? '';
    $mysqlErrorCode = $errorInfo[1] ?? 0;
    $errorMsg = $e->getMessage();
    
    // Check for duplicate entry (SQLSTATE 23000 or MySQL error 1062)
    if ($sqlState == '23000' || $mysqlErrorCode == 1062 || strpos($errorMsg, 'Duplicate entry') !== false) {
        if (stripos($errorMsg, 'email') !== false || stripos($errorMsg, 'users.email') !== false) {
            sendJSONResponse(['success' => false, 'error' => 'Email already registered. Please login or use a different email.']);
        } elseif (stripos($errorMsg, 'phone') !== false || stripos($errorMsg, 'users.phone') !== false || stripos($errorMsg, 'unique_phone') !== false) {
            sendJSONResponse(['success' => false, 'error' => 'Phone number already registered. Please login or use a different phone number.']);
        } else {
            sendJSONResponse(['success' => false, 'error' => 'Failed to place order: Duplicate entry']);
        }
    } else {
        sendJSONResponse(['success' => false, 'error' => 'Failed to place order'], 500);
    }
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Order creation error: ' . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Failed to place order'], 500);
}
?>
