-- Add buying_price column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS buying_price DECIMAL(10, 2) DEFAULT 0.00 AFTER price;

-- Add buying_price column to order_items table to store the buying price at time of order
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS buying_price DECIMAL(10, 2) DEFAULT 0.00 AFTER product_price;

