-- ============================================================================
-- Vehicles System Database Schema Migration
-- ============================================================================
-- This migration creates the vehicles table for the Parking App
-- Vehicles are owned by users (customers) and used for parking sessions
-- Includes Row-Level Security (RLS) policies for role-based access control
-- ============================================================================

-- ============================================================================
-- 1. VEHICLES TABLE
-- ============================================================================
-- Stores vehicle information for users (customers)
-- Each vehicle is linked to a user profile and identified by license plate

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL UNIQUE,
    model TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vehicles table
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_user_active ON vehicles(user_id, is_active) WHERE is_active = TRUE;

-- Trigger to auto-update updated_at for vehicles
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user owns a vehicle
CREATE OR REPLACE FUNCTION is_vehicle_owner(vehicle_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM vehicles
            WHERE id = vehicle_id AND user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user owns a specific vehicle (by vehicle ID and user ID)
CREATE OR REPLACE FUNCTION user_owns_vehicle(vehicle_id UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM vehicles
            WHERE id = vehicle_id AND user_id = user_id_param
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active vehicles count
CREATE OR REPLACE FUNCTION get_user_active_vehicles_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM vehicles
        WHERE user_id = user_id_param AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: VEHICLES TABLE
-- ============================================================================

-- Users can SELECT their own vehicles
CREATE POLICY "Users can view own vehicles"
    ON vehicles FOR SELECT
    USING (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Users can INSERT their own vehicles
CREATE POLICY "Users can insert own vehicles"
    ON vehicles FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Users can UPDATE their own vehicles
CREATE POLICY "Users can update own vehicles"
    ON vehicles FOR UPDATE
    USING (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    )
    WITH CHECK (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Drivers: No direct access to vehicles table
-- (They will access vehicle info through parking_sessions in future migrations)

-- Managers: No direct access to vehicles table
-- (They will access vehicle info through parking_sessions in future migrations)

-- Super Admin can SELECT all vehicles
CREATE POLICY "Super Admin can view all vehicles"
    ON vehicles FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can INSERT vehicles (for admin operations)
CREATE POLICY "Super Admin can insert vehicles"
    ON vehicles FOR INSERT
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can UPDATE all vehicles
CREATE POLICY "Super Admin can update all vehicles"
    ON vehicles FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    )
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can DELETE vehicles
CREATE POLICY "Super Admin can delete vehicles"
    ON vehicles FOR DELETE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- ============================================================================
-- SEED DATA: VEHICLES
-- ============================================================================
-- Note: This seed data assumes you have test users already created
-- Replace the user_id values with actual user IDs from your profiles table
-- To find user IDs: SELECT id, full_name, phone FROM profiles WHERE role_id = (SELECT id FROM roles WHERE name = 'user');

-- Example seed data (commented out - uncomment and update user_id values after creating test users)
/*
INSERT INTO vehicles (user_id, license_plate, model, is_active) VALUES
    -- Replace 'user-uuid-1' with actual user ID
    ('user-uuid-1', 'MH 12 AB 1234', 'Toyota Camry', TRUE),
    ('user-uuid-1', 'MH 14 CD 5678', 'Honda Civic', TRUE),
    -- Replace 'user-uuid-2' with actual user ID
    ('user-uuid-2', 'MH 15 EF 9012', 'Maruti Swift', TRUE),
    -- Replace 'user-uuid-3' with actual user ID
    ('user-uuid-3', 'MH 16 GH 3456', 'Hyundai i20', TRUE)
ON CONFLICT (license_plate) DO NOTHING;
*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE vehicles IS 'Stores vehicle information owned by users (customers)';
COMMENT ON COLUMN vehicles.id IS 'Unique identifier for the vehicle';
COMMENT ON COLUMN vehicles.user_id IS 'References profiles.id - the owner of the vehicle';
COMMENT ON COLUMN vehicles.license_plate IS 'Vehicle license plate number (unique identifier)';
COMMENT ON COLUMN vehicles.model IS 'Vehicle model/make (e.g., Toyota Camry, Honda Civic)';
COMMENT ON COLUMN vehicles.is_active IS 'Whether the vehicle is currently active and can be used for parking';
COMMENT ON COLUMN vehicles.created_at IS 'Timestamp when the vehicle was registered';
COMMENT ON COLUMN vehicles.updated_at IS 'Timestamp when the vehicle record was last updated';

-- ============================================================================
-- EXAMPLE QUERIES FOR TESTING
-- ============================================================================

-- Example 1: User viewing their own vehicles
-- Run this query while authenticated as a user
/*
SELECT 
    id,
    license_plate,
    model,
    is_active,
    created_at
FROM vehicles
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
*/

-- Example 2: User viewing only active vehicles
/*
SELECT 
    id,
    license_plate,
    model,
    created_at
FROM vehicles
WHERE user_id = auth.uid() AND is_active = TRUE
ORDER BY license_plate;
*/

-- Example 3: Super Admin viewing all vehicles with owner information
/*
SELECT 
    v.id,
    v.license_plate,
    v.model,
    v.is_active,
    p.full_name as owner_name,
    p.phone as owner_phone,
    v.created_at
FROM vehicles v
JOIN profiles p ON v.user_id = p.id
ORDER BY v.created_at DESC;
*/

-- Example 4: Super Admin viewing vehicles by owner
/*
SELECT 
    p.full_name,
    p.phone,
    COUNT(v.id) as vehicle_count,
    ARRAY_AGG(v.license_plate) as license_plates
FROM profiles p
LEFT JOIN vehicles v ON p.id = v.user_id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'user')
GROUP BY p.id, p.full_name, p.phone
ORDER BY vehicle_count DESC;
*/

-- Example 5: Check if current user owns a specific vehicle
/*
SELECT is_vehicle_owner('vehicle-uuid-here');
-- Returns: true if user owns the vehicle, false otherwise
*/

-- Example 6: Get count of active vehicles for current user
/*
SELECT get_user_active_vehicles_count(auth.uid());
-- Returns: integer count of active vehicles
*/

-- Example 7: User inserting a new vehicle
/*
INSERT INTO vehicles (user_id, license_plate, model, is_active)
VALUES (
    auth.uid(),
    'MH 20 XY 9999',
    'Tesla Model 3',
    TRUE
)
RETURNING *;
*/

-- Example 8: User updating their vehicle (e.g., deactivating it)
/*
UPDATE vehicles
SET is_active = FALSE
WHERE id = 'vehicle-uuid-here' AND user_id = auth.uid()
RETURNING *;
*/

-- Example 9: Super Admin viewing vehicles with inactive status
/*
SELECT 
    v.license_plate,
    v.model,
    v.is_active,
    p.full_name as owner_name,
    p.phone as owner_phone,
    v.updated_at
FROM vehicles v
JOIN profiles p ON v.user_id = p.id
WHERE v.is_active = FALSE
ORDER BY v.updated_at DESC;
*/

-- Example 10: Find vehicles by license plate (for super admin or future search features)
/*
SELECT 
    v.*,
    p.full_name as owner_name,
    p.phone as owner_phone
FROM vehicles v
JOIN profiles p ON v.user_id = p.id
WHERE v.license_plate ILIKE '%MH 12%'
ORDER BY v.license_plate;
*/

