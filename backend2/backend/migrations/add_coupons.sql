-- Add coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    description TEXT,
    expiry_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL COMMENT 'Admin ID who created the coupon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_coupon (user_id, coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add coupon_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id INT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD FOREIGN KEY IF NOT EXISTS fk_order_coupon (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

