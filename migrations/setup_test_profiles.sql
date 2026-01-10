-- ============================================================================
-- Manual Profile Creation Script
-- ============================================================================
-- Run this in Supabase SQL Editor AFTER creating the auth users
-- This creates profiles for test accounts: user@test.com, driver@test.com, 
-- manager@test.com, and superadmin@test.com
-- ============================================================================

-- STEP 1: First, create the auth users in Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Create these users:
-- 1. user@test.com (password: test123)
-- 2. driver@test.com (password: test123)
-- 3. manager@test.com (password: test123)
-- 4. superadmin@test.com (password: test123)

-- STEP 2: Then run this script to create their profiles

-- Insert profile for user@test.com
INSERT INTO profiles (id, role_id, full_name, phone, email)
SELECT 
    au.id,
    r.id as role_id,
    'Test User',
    '+91 9876543210',
    'user@test.com'
FROM auth.users au
CROSS JOIN roles r
WHERE au.email = 'user@test.com' 
AND r.name = 'user'
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- Insert profile for driver@test.com
INSERT INTO profiles (id, role_id, full_name, phone, email)
SELECT 
    au.id,
    r.id as role_id,
    'Test Driver',
    '+91 9876543211',
    'driver@test.com'
FROM auth.users au
CROSS JOIN roles r
WHERE au.email = 'driver@test.com' 
AND r.name = 'driver'
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- Insert driver record for driver@test.com
INSERT INTO drivers (id, license_number, license_expiry, status)
SELECT 
    au.id,
    'DL1234567890',
    '2026-12-31',
    'approved'
FROM auth.users au
WHERE au.email = 'driver@test.com'
ON CONFLICT (id) DO UPDATE SET
    license_number = EXCLUDED.license_number,
    license_expiry = EXCLUDED.license_expiry,
    status = EXCLUDED.status;

-- Insert profile for manager@test.com
INSERT INTO profiles (id, role_id, full_name, phone, email)
SELECT 
    au.id,
    r.id as role_id,
    'Test Manager',
    '+91 9876543212',
    'manager@test.com'
FROM auth.users au
CROSS JOIN roles r
WHERE au.email = 'manager@test.com' 
AND r.name = 'manager'
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- Insert profile for superadmin@test.com
INSERT INTO profiles (id, role_id, full_name, phone, email)
SELECT 
    au.id,
    r.id as role_id,
    'Super Admin',
    '+91 9876543213',
    'superadmin@test.com'
FROM auth.users au
CROSS JOIN roles r
WHERE au.email = 'superadmin@test.com' 
AND r.name = 'super_admin'
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- Insert test sites
INSERT INTO sites (name, address, city, state, pincode, is_active) VALUES
    ('Inorbit Mall - Malad', 'Link Road, Malad West', 'Mumbai', 'Maharashtra', '400064', TRUE),
    ('Phoenix Mall - Lower Parel', 'Senapati Bapat Marg, Lower Parel', 'Mumbai', 'Maharashtra', '400013', TRUE),
    ('Infiniti Mall - Andheri', 'New Link Road, Andheri West', 'Mumbai', 'Maharashtra', '400053', TRUE)
ON CONFLICT DO NOTHING;

-- Assign manager to all sites
INSERT INTO manager_sites (manager_id, site_id)
SELECT 
    p.id as manager_id,
    s.id as site_id
FROM profiles p
CROSS JOIN sites s
WHERE p.email = 'manager@test.com'
ON CONFLICT (manager_id, site_id) DO NOTHING;

-- Assign driver to all sites
INSERT INTO driver_sites (driver_id, site_id)
SELECT 
    p.id as driver_id,
    s.id as site_id
FROM profiles p
CROSS JOIN sites s
WHERE p.email = 'driver@test.com'
ON CONFLICT (driver_id, site_id) DO NOTHING;

-- Verify the profiles were created
SELECT 
    p.id,
    p.email,
    p.full_name,
    r.name as role
FROM profiles p
JOIN roles r ON p.role_id = r.id
WHERE p.email IN ('user@test.com', 'driver@test.com', 'manager@test.com', 'superadmin@test.com')
ORDER BY r.name;
