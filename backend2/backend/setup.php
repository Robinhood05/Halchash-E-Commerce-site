<?php
/**
 * Setup Script for Halchash Backend
 * Run this once after uploading files to server
 */

require_once 'config/database.php';

echo "<h1>Halchash Backend Setup</h1>";

try {
    $pdo = getDBConnection();
    echo "<p style='color: green;'>✓ Database connection successful!</p>";
    
    // Check if tables exist
    $tables = ['users', 'admins', 'categories', 'products', 'cart', 'orders'];
    $missing = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() === 0) {
            $missing[] = $table;
        }
    }
    
    if (!empty($missing)) {
        echo "<p style='color: red;'>✗ Missing tables: " . implode(', ', $missing) . "</p>";
        echo "<p>Please import database.sql file first.</p>";
    } else {
        echo "<p style='color: green;'>✓ All database tables exist!</p>";
    }
    
    // Check uploads directory
    $uploadDir = __DIR__ . '/uploads/products/';
    if (!is_dir($uploadDir)) {
        if (mkdir($uploadDir, 0755, true)) {
            echo "<p style='color: green;'>✓ Created uploads directory!</p>";
        } else {
            echo "<p style='color: red;'>✗ Failed to create uploads directory. Please create manually with 755 permissions.</p>";
        }
    } else {
        echo "<p style='color: green;'>✓ Uploads directory exists!</p>";
    }
    
    // Check if writable
    if (is_writable($uploadDir)) {
        echo "<p style='color: green;'>✓ Uploads directory is writable!</p>";
    } else {
        echo "<p style='color: orange;'>⚠ Uploads directory is not writable. Please set permissions to 755.</p>";
    }
    
    // Check default admin
    $stmt = $pdo->query("SELECT COUNT(*) FROM admins WHERE username = 'admin'");
    if ($stmt->fetchColumn() > 0) {
        echo "<p style='color: green;'>✓ Default admin account exists!</p>";
        echo "<p><strong>Default credentials:</strong> admin / admin123</p>";
        echo "<p style='color: red;'><strong>IMPORTANT:</strong> Change the default password after first login!</p>";
    } else {
        echo "<p style='color: orange;'>⚠ Default admin not found. Creating...</p>";
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admins (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['admin', 'admin@halchash.com', $hashedPassword, 'Administrator', 'super_admin']);
        echo "<p style='color: green;'>✓ Default admin created!</p>";
    }
    
    echo "<hr>";
    echo "<h2>Setup Complete!</h2>";
    echo "<p>You can now:</p>";
    echo "<ul>";
    echo "<li>Access admin panel: <a href='admin/'>Admin Panel</a></li>";
    echo "<li>Test API endpoints: <a href='api/products/index.php'>Products API</a></li>";
    echo "</ul>";
    echo "<p><strong>Security Note:</strong> Delete this setup.php file after setup is complete!</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Please check your database configuration in config/database.php</p>";
}
?>

