<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'robin');
define('DB_PASS', '1234');
define('DB_NAME', 'halchash_db');

// Function to create and return PDO connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        // Log error internally and rethrow
        error_log("Database connection failed: " . $e->getMessage());
        throw $e;
    }
}

// --- Test Connection ---
try {
    $pdo = getDBConnection();
    echo "✅ Database connection successful!";
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage();
}
