<?php
// Database configuration
// Supports both Local Development and Production environments

// ============================================
// LOCAL DEVELOPMENT CONFIGURATION (XAMPP)
// ============================================
define('DB_HOST_LOCAL', 'localhost');
define('DB_USER_LOCAL', 'robin');      // Change to your local MySQL username
define('DB_PASS_LOCAL', '1234');       // Change to your local MySQL password
define('DB_NAME_LOCAL', 'halchash_db');

// ============================================
// PRODUCTION CONFIGURATION (InfinityFree)
// ============================================
define('DB_HOST_PROD', 'sql311.infinityfree.com');
define('DB_USER_PROD', 'if0_40378200');
define('DB_PASS_PROD', '9h6QEjsTNh');
define('DB_NAME_PROD', 'if0_40378200_halchash_db');
define('DB_PORT_PROD', '3306');

// ============================================
// AUTO-DETECT ENVIRONMENT
// ============================================
// You can also manually set this to 'local' or 'production' to force a specific environment
$forceEnvironment = null; // Set to 'local' or 'production' to override auto-detection

if ($forceEnvironment === 'local' || $forceEnvironment === 'production') {
    $isLocal = ($forceEnvironment === 'local');
} else {
    // Auto-detect based on server environment
    $isLocal = strpos(__DIR__, 'xampp') !== false || 
               strpos(__DIR__, 'localhost') !== false || 
               strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false ||
               strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false ||
               (isset($_SERVER['SERVER_NAME']) && in_array($_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1'])) ||
               (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], ':8000') !== false) ||
               (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], ':5173') !== false);
}

// Set active database configuration
if ($isLocal) {
    // Local Development
    define('DB_HOST', DB_HOST_LOCAL);
    define('DB_USER', DB_USER_LOCAL);
    define('DB_PASS', DB_PASS_LOCAL);
    define('DB_NAME', DB_NAME_LOCAL);
    define('DB_PORT', '3306');
} else {
    // Production
    define('DB_HOST', DB_HOST_PROD);
    define('DB_USER', DB_USER_PROD);
    define('DB_PASS', DB_PASS_PROD);
    define('DB_NAME', DB_NAME_PROD);
    define('DB_PORT', DB_PORT_PROD);
}

// Base path configuration for uploads
// Production: root directory (uploads/), Local: /backend/uploads/
define('UPLOAD_BASE_PATH', $isLocal ? '/backend/uploads' : '/uploads');

// Create database connection
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        $env = (defined('DB_HOST') && DB_HOST === DB_HOST_LOCAL) ? 'LOCAL' : 'PRODUCTION';
        error_log("Database connection failed [{$env}]: " . $e->getMessage());
        error_log("Attempted connection to: " . DB_HOST . ":" . DB_PORT . " / " . DB_NAME . " with user: " . DB_USER);
        
        // Only send JSON response if this is an API request
        $isApiRequest = (
            strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false ||
            (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
        );
        
        if ($isApiRequest) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false, 
                'error' => 'Database connection failed',
                'environment' => $env,
                'host' => DB_HOST,
                'database' => DB_NAME
            ]);
            exit;
        } else {
            // For non-API requests (like admin pages), throw exception so calling code can handle it
            throw $e;
        }
    }
}

// Helper function to send JSON response
function sendJSONResponse($data, $statusCode = 200) {
    // Clear any output buffer to prevent HTML errors from being sent
    if (ob_get_level() > 0) {
        ob_clean();
    }
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    if (ob_get_level() > 0) {
        ob_end_flush();
    }
    exit;
}

// Helper function to validate required fields
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing[] = $field;
        }
    }
    return $missing;
}

// Helper function to sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Helper function to generate slug
function generateSlug($string) {
    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9]+/', '-', $string);
    $string = trim($string, '-');
    return $string;
}
