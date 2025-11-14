-- Add blocked_users table to track blocked phone numbers
CREATE TABLE IF NOT EXISTS blocked_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    reason TEXT,
    blocked_by INT NOT NULL COMMENT 'Admin ID who blocked the user',
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocked_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

