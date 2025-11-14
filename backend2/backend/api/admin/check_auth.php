<?php
session_start();
require_once '../../config/cors.php';

if (!isset($_SESSION['admin_id'])) {
    sendJSONResponse(['success' => false, 'error' => 'Not authenticated'], 401);
}

sendJSONResponse([
    'success' => true,
    'admin' => [
        'id' => $_SESSION['admin_id'],
        'username' => $_SESSION['admin_username'],
        'role' => $_SESSION['admin_role']
    ]
]);

?>

