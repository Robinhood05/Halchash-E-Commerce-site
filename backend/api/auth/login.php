<?php
// Start output buffering to prevent any unwanted output
ob_start();

// Turn off error display (errors will be logged instead)
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

// Clear any output that might have been generated
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = sanitizeInput($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    sendJSONResponse(['success' => false, 'error' => 'Email and password are required']);
}

try {
    $pdo = getDBConnection();
    
    // Normalize email to lowercase for case-insensitive lookup
    $emailLower = strtolower(trim($email));
    
    // Check if user exists with this email (case-insensitive)
    $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1");
    $stmt->execute([$emailLower]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validate user exists and has password
    if (!$user) {
        error_log("Login attempt with non-existent email: " . $emailLower);
        sendJSONResponse(['success' => false, 'error' => 'Invalid email or password'], 401);
    }

    // Check if user has a password set
    if (empty($user['password'])) {
        error_log("Login attempt for user without password: " . $emailLower);
        sendJSONResponse(['success' => false, 'error' => 'Account setup incomplete. Please contact support.'], 401);
    }

    // Verify password
    $passwordValid = password_verify($password, $user['password']);
    
    // If password verification fails, check if password needs rehashing (for old accounts)
    if (!$passwordValid) {
        // Check if it's an old plain text password (for migration purposes)
        // Only check if password hash doesn't start with $2y$ (bcrypt) or $argon2 (argon2)
        $hashPrefix = substr($user['password'], 0, 4);
        if ($hashPrefix !== '$2y$' && $hashPrefix !== '$2a$' && $hashPrefix !== '$2b$' && strpos($user['password'], '$argon2') === false) {
            // Old plain text or different hash format - try direct comparison for migration
            if ($user['password'] === $password) {
                // Old plain text password found - rehash it
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                $updateStmt->execute([$newHash, $user['id']]);
                error_log("Migrated old password hash for user: " . $emailLower);
                $passwordValid = true;
            }
        }
    }
    
    if (!$passwordValid) {
        error_log("Login attempt with incorrect password for email: " . $emailLower);
        error_log("Password hash prefix: " . substr($user['password'], 0, 10));
        sendJSONResponse(['success' => false, 'error' => 'Invalid email or password'], 401);
    }
    
    // Check if password needs rehashing (for security - upgrade old bcrypt hashes)
    if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $user['id']]);
        error_log("Rehashed password for user: " . $emailLower);
    }

    // Password is correct - proceed with login
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
    
    // Note: JWT token is stored in frontend cookies, not in database
    // If you want to store it in database, add jwt_token column to users table
    
    // Remove sensitive data from response
    unset($user['password']);
    $user['jwt_token'] = $jwtToken;
    
    // Set auth_token cookie from backend (works across different ports/domains)
    setcookie('auth_token', $jwtToken, [
        'expires' => time() + (7 * 24 * 60 * 60), // 7 days
        'path' => '/',
        'domain' => '', // Empty domain works for localhost
        'secure' => false, // Set to true in production with HTTPS
        'httponly' => false, // Allow JavaScript access
        'samesite' => 'Lax'
    ]);
    
    error_log("Successful login for user: " . $user['email'] . " (ID: " . $user['id'] . ")");
    sendJSONResponse([
        'success' => true,
        'user' => $user,
        'token' => $jwtToken,
        'message' => 'Login successful'
    ]);
} catch (PDOException $e) {
    error_log("Login database error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJSONResponse([
        'success' => false, 
        'error' => 'Database error. Please try again later.',
        'debug' => (ini_get('display_errors') ? $e->getMessage() : null)
    ], 500);
} catch (Exception $e) {
    error_log("Login general error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJSONResponse([
        'success' => false, 
        'error' => 'Login failed. Please try again.',
        'debug' => (ini_get('display_errors') ? $e->getMessage() : null)
    ], 500);
} catch (Error $e) {
    // Catch fatal errors
    error_log("Login fatal error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJSONResponse([
        'success' => false, 
        'error' => 'Server error. Please contact support.',
        'debug' => (ini_get('display_errors') ? $e->getMessage() : null)
    ], 500);
}

?>

