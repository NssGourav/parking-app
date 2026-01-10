-- ============================================================================
-- Add Missing Columns to parking_sessions Table
-- ============================================================================
-- This migration adds the missing columns needed for the parking app
-- ============================================================================

-- Add missing columns to parking_sessions table
ALTER TABLE parking_sessions 
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT CHECK (vehicle_type IN ('car', 'bike', 'suv')),
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS exit_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS parking_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_vehicle_number ON parking_sessions(vehicle_number);

-- Update existing records to have default status if NULL
UPDATE parking_sessions 
SET status = 'active' 
WHERE status IS NULL;

-- Make status NOT NULL after setting defaults
ALTER TABLE parking_sessions 
ALTER COLUMN status SET NOT NULL;

-- Add comments
COMMENT ON COLUMN parking_sessions.exit_time IS 'When the vehicle was retrieved (NULL if still parked)';
COMMENT ON COLUMN parking_sessions.status IS 'Session status: active (parked), completed (exited), or cancelled';
COMMENT ON COLUMN parking_sessions.entry_time IS 'When the vehicle was parked';
COMMENT ON COLUMN parking_sessions.parking_fee IS 'Fee charged for this parking session';
