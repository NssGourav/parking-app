-- ============================================================================
-- Add License Expiry and Photo details to Pending Drivers
-- ============================================================================

ALTER TABLE pending_drivers 
ADD COLUMN IF NOT EXISTS license_expiry TEXT,
ADD COLUMN IF NOT EXISTS driver_photo_url TEXT,
ADD COLUMN IF NOT EXISTS license_photo_url TEXT;

-- Update comments
COMMENT ON COLUMN pending_drivers.license_expiry IS 'Expiry date of the driving license';
COMMENT ON COLUMN pending_drivers.driver_photo_url IS 'URL to the driver portrait photo';
COMMENT ON COLUMN pending_drivers.license_photo_url IS 'URL to the driving license document photo';
