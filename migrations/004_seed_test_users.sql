-- ============================================================================
-- Seed Data: Test User Profiles
-- ============================================================================
-- Creates test profiles for each role to enable testing without manual setup
-- These profiles link to Supabase Auth users that must be created separately
-- ============================================================================

-- Note: Before running this migration, ensure the following users exist in Supabase Auth:
-- 1. user@test.com (for regular user)
-- 2. driver@test.com (for driver)
-- 3. manager@test.com (for manager)
-- 4. superadmin@test.com (for super admin)

-- ============================================================================
-- Insert Test Profiles
-- ============================================================================

-- Get role IDs
DO $$
DECLARE
    user_role_id UUID;
    driver_role_id UUID;
    manager_role_id UUID;
    super_admin_role_id UUID;
BEGIN
    -- Fetch role IDs
    SELECT id INTO user_role_id FROM roles WHERE name = 'user';
    SELECT id INTO driver_role_id FROM roles WHERE name = 'driver';
    SELECT id INTO manager_role_id FROM roles WHERE name = 'manager';
    SELECT id INTO super_admin_role_id FROM roles WHERE name = 'super_admin';

    -- Insert test profiles (using placeholder UUIDs - these will need to be updated with actual auth.users IDs)
    -- The actual user IDs should come from Supabase Auth after creating the users
    
    -- Note: You'll need to manually update these with the correct user IDs from auth.users
    -- Or use the Supabase dashboard to create these profiles after users sign up
    
END $$;

-- ============================================================================
-- Insert Test Sites
-- ============================================================================

INSERT INTO sites (name, address, city, state, pincode, is_active) VALUES
    ('Inorbit Mall - Malad', 'Link Road, Malad West', 'Mumbai', 'Maharashtra', '400064', TRUE),
    ('Phoenix Mall - Lower Parel', 'Senapati Bapat Marg, Lower Parel', 'Mumbai', 'Maharashtra', '400013', TRUE),
    ('Infiniti Mall - Andheri', 'New Link Road, Andheri West', 'Mumbai', 'Maharashtra', '400053', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE sites IS 'Test parking sites for development and testing';
