<?php
// CORS configuration for API
// This script handles CORS headers for all API requests

// Suppress any output
if (ob_get_level() > 0) {
    ob_clean();
}

// Allowed origins - add your dev and production origins here
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost/halchash'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Set CORS headers
if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    // Fallback for development - allow all origins (but no credentials with wildcard)
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 86400'); // cache preflight for 1 day

// Handle preflight requests and exit early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // send 200 for preflight and terminate
    http_response_code(200);
    header('Content-Length: 0');
    if (ob_get_level() > 0) {
        ob_end_clean();
    }
    exit;
}
