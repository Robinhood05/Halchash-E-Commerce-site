<?php
// Simple JWT token generation
// For production, consider using a proper JWT library like firebase/php-jwt

function generateJWT($userId, $email) {
    // Create a simple token payload
    $payload = [
        'user_id' => $userId,
        'email' => $email,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days
    ];
    
    // For now, create a simple token (base64 encoded JSON)
    // In production, use proper JWT signing with a secret key
    $token = base64_encode(json_encode($payload));
    
    return $token;
}

function verifyJWT($token) {
    try {
        $decoded = json_decode(base64_decode($token), true);
        
        if (!$decoded) {
            return false;
        }
        
        // Check if token is expired
        if (isset($decoded['exp']) && $decoded['exp'] < time()) {
            return false;
        }
        
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}

?>
