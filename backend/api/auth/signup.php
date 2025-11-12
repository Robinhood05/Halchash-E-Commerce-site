<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendJSONResponse(['success' => false, 'error' => 'Invalid JSON data: ' . json_last_error_msg()], 400);
}

if (empty($data)) {
    sendJSONResponse(['success' => false, 'error' => 'No data received'], 400);
}

$name = sanitizeInput($data['name'] ?? '');
$email = sanitizeInput($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = sanitizeInput($data['phone'] ?? '');
$address = sanitizeInput($data['address'] ?? '');

$missing = validateRequired(['name' => $name, 'email' => $email, 'password' => $password], ['name', 'email', 'password']);
if (!empty($missing)) {
    sendJSONResponse(['success' => false, 'error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
}

if (strlen($password) < 6) {
    sendJSONResponse(['success' => false, 'error' => 'Password must be at least 6 characters']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJSONResponse(['success' => false, 'error' => 'Invalid email format']);
}

try {
    $pdo = getDBConnection();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendJSONResponse(['success' => false, 'error' => 'Email already registered']);
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate avatar URL
    $avatar = "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=059669&color=fff";

    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, phone, address, avatar) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $hashedPassword, $phone, $address, $avatar]);

    $userId = $pdo->lastInsertId();
    
    // Get created user
    $stmt = $pdo->prepare("SELECT id, name, email, phone, address, avatar, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    // Generate JWT token
    try {
        if (!function_exists('generateJWT')) {
            // Fallback: create simple token if JWT function doesn't exist
            $jwtToken = base64_encode(json_encode([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'iat' => time(),
                'exp' => time() + (7 * 24 * 60 * 60)
            ]));
        } else {
            $jwtToken = generateJWT($user['id'], $user['email']);
        }
    } catch (Exception $e) {
        error_log("JWT generation error: " . $e->getMessage());
        // Fallback token
        $jwtToken = base64_encode(json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'iat' => time()
        ]));
    }

    // Set auth_token cookie from backend
    setcookie('auth_token', $jwtToken, [
        'expires' => time() + (7 * 24 * 60 * 60), // 7 days
        'path' => '/',
        'domain' => '', // Empty domain works for localhost
        'secure' => false, // Set to true in production with HTTPS
        'httponly' => false, // Allow JavaScript access
        'samesite' => 'Lax'
    ]);

    $user['jwt_token'] = $jwtToken;

    sendJSONResponse([
        'success' => true,
        'user' => $user,
        'token' => $jwtToken,
        'message' => 'Account created successfully'
    ]);
} catch (PDOException $e) {
    error_log("Signup error: " . $e->getMessage());
    sendJSONResponse(['success' => false, 'error' => 'Registration failed'], 500);
}

?>

