-- ============================================================================
-- Add owner details to vehicles table
-- ============================================================================
-- This migration adds owner_name and owner_phone to the vehicles table
-- to ensure the source of truth for the vehicle owner's data is maintained.

ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_phone TEXT;

-- Update existing vehicles with profile name/phone as a default (optional)
UPDATE vehicles v
SET 
    owner_name = p.full_name,
    owner_phone = p.phone
FROM profiles p
WHERE v.user_id = p.id AND v.owner_name IS NULL;

-- Comments for documentation
COMMENT ON COLUMN vehicles.owner_name IS 'The name of the vehicle owner (entered during registration)';
COMMENT ON COLUMN vehicles.owner_phone IS 'The contact phone number of the vehicle owner';
