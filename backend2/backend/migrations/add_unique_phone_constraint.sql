-- Add UNIQUE constraint to phone column in users table
-- This ensures that each phone number can only be used by one user

-- Step 1: Convert empty strings to NULL for consistency
UPDATE users 
SET phone = NULL 
WHERE phone IS NOT NULL AND TRIM(phone) = '';

-- Step 2: Handle any existing duplicate phone numbers by setting them to NULL
-- (Keep the phone number for the user with the lowest ID)
UPDATE users u1
INNER JOIN (
    SELECT phone, MIN(id) as min_id
    FROM users
    WHERE phone IS NOT NULL AND TRIM(phone) != ''
    GROUP BY phone
    HAVING COUNT(*) > 1
) u2 ON u1.phone = u2.phone AND u1.id != u2.min_id
SET u1.phone = NULL;

-- Step 3: Add UNIQUE constraint to phone column
-- Note: If the constraint already exists, this will fail, which is expected
-- You can safely ignore the error if running the migration multiple times
ALTER TABLE users 
ADD UNIQUE KEY unique_phone (phone);

