-- ============================================================================
-- Users System Database Schema Migration
-- ============================================================================
-- This migration creates the complete users system for the Parking App
-- Supports 4 roles: User (Customer), Driver, Manager, Super Admin
-- Includes Row-Level Security (RLS) policies for role-based access control
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
-- Defines the 4 user roles in the system
-- Uses a table instead of ENUM for flexibility and future expansion

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role name lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- ============================================================================
-- 2. PROFILES TABLE
-- ============================================================================
-- User profiles linked to Supabase Auth (auth.users)
-- Every authenticated user has a profile with a role assignment

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. SITES TABLE
-- ============================================================================
-- Parking locations (malls, plazas, etc.)
-- Managers and drivers are assigned to specific sites

CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sites
CREATE INDEX IF NOT EXISTS idx_sites_is_active ON sites(is_active);
CREATE INDEX IF NOT EXISTS idx_sites_city ON sites(city);
CREATE INDEX IF NOT EXISTS idx_sites_state ON sites(state);

-- Trigger to auto-update updated_at for sites
CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. DRIVERS TABLE
-- ============================================================================
-- Driver-specific information and approval workflow
-- Links to profiles table (one-to-one relationship)

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    license_expiry DATE,
    license_document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for drivers
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_approved_by ON drivers(approved_by) WHERE approved_by IS NOT NULL;

-- Trigger to auto-update updated_at for drivers
CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. MANAGER_SITES TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between managers and sites
-- A manager can be assigned to multiple sites

CREATE TABLE IF NOT EXISTS manager_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(manager_id, site_id)
);

-- Indexes for manager_sites
CREATE INDEX IF NOT EXISTS idx_manager_sites_manager_id ON manager_sites(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_sites_site_id ON manager_sites(site_id);

-- ============================================================================
-- 6. DRIVER_SITES TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between drivers and sites
-- A driver can be assigned to multiple sites

CREATE TABLE IF NOT EXISTS driver_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id, site_id)
);

-- Indexes for driver_sites
CREATE INDEX IF NOT EXISTS idx_driver_sites_driver_id ON driver_sites(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_sites_site_id ON driver_sites(site_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's role name
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r.name
        FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.id = user_id AND r.name = 'super_admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.id = user_id AND r.name = 'manager'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get manager's assigned site IDs
CREATE OR REPLACE FUNCTION get_manager_site_ids(manager_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN (
        SELECT ARRAY_AGG(site_id)
        FROM manager_sites
        WHERE manager_id = manager_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if manager has access to a site
CREATE OR REPLACE FUNCTION manager_has_site_access(manager_user_id UUID, target_site_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM manager_sites
            WHERE manager_id = manager_user_id AND site_id = target_site_id
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_sites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: PROFILES TABLE
-- ============================================================================

-- Users can only SELECT/UPDATE their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'user'
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'user'
    );

-- Drivers can SELECT/UPDATE their own profile
CREATE POLICY "Drivers can view own profile"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'driver'
    );

CREATE POLICY "Drivers can update own profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'driver'
    );

-- Managers can SELECT profiles for users/drivers at their assigned sites
-- This is a complex policy that checks if the profile belongs to someone
-- who has interacted with the manager's sites (via future parking_sessions)
-- For now, managers can see all profiles but should filter by site in application logic
CREATE POLICY "Managers can view profiles at assigned sites"
    ON profiles FOR SELECT
    USING (
        is_manager(auth.uid()) = TRUE
    );

-- Super Admin can SELECT/UPDATE all profiles
CREATE POLICY "Super Admin can view all profiles"
    ON profiles FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can update all profiles"
    ON profiles FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Allow users to insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id
    );

-- ============================================================================
-- RLS POLICIES: DRIVERS TABLE
-- ============================================================================

-- Drivers can SELECT/UPDATE their own driver record
CREATE POLICY "Drivers can view own record"
    ON drivers FOR SELECT
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'driver'
    );

CREATE POLICY "Drivers can update own record"
    ON drivers FOR UPDATE
    USING (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'driver'
    );

-- Managers can SELECT drivers assigned to their sites
CREATE POLICY "Managers can view drivers at assigned sites"
    ON drivers FOR SELECT
    USING (
        is_manager(auth.uid()) = TRUE AND
        EXISTS (
            SELECT 1
            FROM driver_sites ds
            JOIN manager_sites ms ON ds.site_id = ms.site_id
            WHERE ds.driver_id = drivers.id
            AND ms.manager_id = auth.uid()
        )
    );

-- Super Admin can SELECT/UPDATE all driver records
CREATE POLICY "Super Admin can view all drivers"
    ON drivers FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can update all drivers"
    ON drivers FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Allow drivers to insert their own record (during registration)
CREATE POLICY "Drivers can insert own record"
    ON drivers FOR INSERT
    WITH CHECK (
        auth.uid() = id AND 
        get_user_role(auth.uid()) = 'driver'
    );

-- ============================================================================
-- RLS POLICIES: SITES TABLE
-- ============================================================================

-- Users can SELECT active sites
CREATE POLICY "Users can view active sites"
    ON sites FOR SELECT
    USING (
        is_active = TRUE AND
        get_user_role(auth.uid()) = 'user'
    );

-- Drivers can SELECT sites they're assigned to
CREATE POLICY "Drivers can view assigned sites"
    ON sites FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM driver_sites
            WHERE driver_id = auth.uid() AND site_id = sites.id
        ) AND
        get_user_role(auth.uid()) = 'driver'
    );

-- Managers can SELECT sites they're assigned to
CREATE POLICY "Managers can view assigned sites"
    ON sites FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM manager_sites
            WHERE manager_id = auth.uid() AND site_id = sites.id
        ) AND
        is_manager(auth.uid()) = TRUE
    );

-- Super Admin can SELECT/INSERT/UPDATE/DELETE all sites
CREATE POLICY "Super Admin can view all sites"
    ON sites FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can insert sites"
    ON sites FOR INSERT
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can update sites"
    ON sites FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can delete sites"
    ON sites FOR DELETE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- ============================================================================
-- RLS POLICIES: MANAGER_SITES TABLE
-- ============================================================================

-- Managers can SELECT their own assignments
CREATE POLICY "Managers can view own assignments"
    ON manager_sites FOR SELECT
    USING (
        manager_id = auth.uid() AND
        is_manager(auth.uid()) = TRUE
    );

-- Super Admin can SELECT/INSERT/DELETE all assignments
CREATE POLICY "Super Admin can view all manager assignments"
    ON manager_sites FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can insert manager assignments"
    ON manager_sites FOR INSERT
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can delete manager assignments"
    ON manager_sites FOR DELETE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- ============================================================================
-- RLS POLICIES: DRIVER_SITES TABLE
-- ============================================================================

-- Drivers can SELECT their own assignments
CREATE POLICY "Drivers can view own assignments"
    ON driver_sites FOR SELECT
    USING (
        driver_id = auth.uid() AND
        get_user_role(auth.uid()) = 'driver'
    );

-- Managers can SELECT assignments for their sites
CREATE POLICY "Managers can view driver assignments at their sites"
    ON driver_sites FOR SELECT
    USING (
        is_manager(auth.uid()) = TRUE AND
        EXISTS (
            SELECT 1
            FROM manager_sites
            WHERE manager_id = auth.uid() AND site_id = driver_sites.site_id
        )
    );

-- Super Admin can SELECT/INSERT/DELETE all assignments
CREATE POLICY "Super Admin can view all driver assignments"
    ON driver_sites FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can insert driver assignments"
    ON driver_sites FOR INSERT
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

CREATE POLICY "Super Admin can delete driver assignments"
    ON driver_sites FOR DELETE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- ============================================================================
-- SEED DATA: ROLES
-- ============================================================================

INSERT INTO roles (name, description) VALUES
    ('user', 'Regular customer who parks and retrieves cars'),
    ('driver', 'Valet driver who accepts parking/retrieval tasks'),
    ('manager', 'Site manager who monitors live sessions and manages drivers'),
    ('super_admin', 'System administrator with full access to all features')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE roles IS 'Defines the 4 user roles in the system';
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth, contains role assignment';
COMMENT ON TABLE sites IS 'Parking locations where users park their vehicles';
COMMENT ON TABLE drivers IS 'Driver-specific information including license and approval status';
COMMENT ON TABLE manager_sites IS 'Junction table linking managers to their assigned sites';
COMMENT ON TABLE driver_sites IS 'Junction table linking drivers to their assigned sites';

COMMENT ON COLUMN profiles.role_id IS 'References roles.id - determines user permissions';
COMMENT ON COLUMN drivers.status IS 'Driver approval status: pending, approved, rejected, or suspended';
COMMENT ON COLUMN drivers.approved_by IS 'Super admin who approved/rejected the driver';
COMMENT ON COLUMN sites.is_active IS 'Whether the site is currently operational';

