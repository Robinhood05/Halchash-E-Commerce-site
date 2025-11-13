<?php
/**
 * Database Connection Test Script
 * Use this to test both local and production database connections
 * Access via: http://localhost/halchash/backend/config/database_test.php
 */

require_once 'database.php';

echo "<!DOCTYPE html>";
echo "<html><head><title>Database Connection Test</title>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .test-section { margin: 20px 0; padding: 15px; border-radius: 5px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
    pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    .config-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .config-table th, .config-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .config-table th { background: #f8f9fa; font-weight: bold; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔍 Database Connection Test</h1>";

// Show current environment
$isLocal = (DB_HOST === DB_HOST_LOCAL);
$currentEnv = $isLocal ? 'LOCAL' : 'PRODUCTION';
echo "<div class='test-section info'>";
echo "<h2>Current Environment: <strong>{$currentEnv}</strong></h2>";
echo "<p>Auto-detected based on server configuration</p>";
echo "</div>";

// Show configuration
echo "<div class='test-section info'>";
echo "<h3>Active Configuration:</h3>";
echo "<table class='config-table'>";
echo "<tr><th>Setting</th><th>Value</th></tr>";
echo "<tr><td>Host</td><td>" . htmlspecialchars(DB_HOST) . "</td></tr>";
echo "<tr><td>Port</td><td>" . htmlspecialchars(DB_PORT) . "</td></tr>";
echo "<tr><td>Database</td><td>" . htmlspecialchars(DB_NAME) . "</td></tr>";
echo "<tr><td>Username</td><td>" . htmlspecialchars(DB_USER) . "</td></tr>";
echo "<tr><td>Password</td><td>" . str_repeat('*', strlen(DB_PASS)) . "</td></tr>";
echo "</table>";
echo "</div>";

// Test connection
echo "<div class='test-section'>";
echo "<h3>Connection Test:</h3>";

try {
    $pdo = getDBConnection();
    echo "<div class='success'>";
    echo "<strong>✅ Connection Successful!</strong><br>";
    echo "Successfully connected to database: <strong>" . htmlspecialchars(DB_NAME) . "</strong>";
    echo "</div>";
    
    // Test query
    echo "<h3>Database Information:</h3>";
    $stmt = $pdo->query("SELECT VERSION() as version");
    $version = $stmt->fetch();
    echo "<p><strong>MySQL Version:</strong> " . htmlspecialchars($version['version']) . "</p>";
    
    // Check tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<p><strong>Tables Found:</strong> " . count($tables) . "</p>";
    if (count($tables) > 0) {
        echo "<ul>";
        foreach ($tables as $table) {
            echo "<li>" . htmlspecialchars($table) . "</li>";
        }
        echo "</ul>";
    }
    
    // Check admin user
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM admins");
        $adminCount = $stmt->fetch();
        echo "<p><strong>Admin Users:</strong> " . $adminCount['count'] . "</p>";
    } catch (PDOException $e) {
        echo "<p class='error'>⚠️ Admins table not found or error: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
} catch (PDOException $e) {
    echo "<div class='error'>";
    echo "<strong>❌ Connection Failed!</strong><br>";
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br><br>";
    echo "<strong>Troubleshooting:</strong><ul>";
    echo "<li>Check if MySQL server is running</li>";
    echo "<li>Verify database credentials in database.php</li>";
    echo "<li>Ensure database '" . htmlspecialchars(DB_NAME) . "' exists</li>";
    echo "<li>Check firewall/network settings if using remote host</li>";
    echo "</ul>";
    echo "</div>";
}

echo "</div>";

// Show both configurations
echo "<div class='test-section info'>";
echo "<h3>Available Configurations:</h3>";
echo "<table class='config-table'>";
echo "<tr><th>Environment</th><th>Host</th><th>Database</th><th>Username</th></tr>";
echo "<tr><td><strong>LOCAL</strong></td><td>" . htmlspecialchars(DB_HOST_LOCAL) . "</td><td>" . htmlspecialchars(DB_NAME_LOCAL) . "</td><td>" . htmlspecialchars(DB_USER_LOCAL) . "</td></tr>";
echo "<tr><td><strong>PRODUCTION</strong></td><td>" . htmlspecialchars(DB_HOST_PROD) . "</td><td>" . htmlspecialchars(DB_NAME_PROD) . "</td><td>" . htmlspecialchars(DB_USER_PROD) . "</td></tr>";
echo "</table>";
echo "<p><em>To switch environments, edit <code>backend/config/database.php</code> and set <code>\$forceEnvironment</code> variable.</em></p>";
echo "</div>";

echo "</div></body></html>";
?>

