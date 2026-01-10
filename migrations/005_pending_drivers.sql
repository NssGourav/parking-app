-- ============================================================================
-- Pending Drivers Table
-- ============================================================================
-- This migration creates a table to store pending driver applications
-- submitted by managers before they are approved by Super Admin.
-- ============================================================================

-- Create pending_drivers table
CREATE TABLE IF NOT EXISTS pending_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    dob TEXT,
    license_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pending_drivers
CREATE INDEX IF NOT EXISTS idx_pending_drivers_status ON pending_drivers(status);
CREATE INDEX IF NOT EXISTS idx_pending_drivers_phone ON pending_drivers(phone);
CREATE INDEX IF NOT EXISTS idx_pending_drivers_submitted_by ON pending_drivers(submitted_by) WHERE submitted_by IS NOT NULL;

-- Trigger to auto-update updated_at for pending_drivers
CREATE TRIGGER update_pending_drivers_updated_at
    BEFORE UPDATE ON pending_drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE pending_drivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_drivers

-- Managers can insert pending driver records
CREATE POLICY "Managers can insert pending drivers"
    ON pending_drivers FOR INSERT
    WITH CHECK (
        is_manager(auth.uid()) = TRUE
    );

-- Managers can view pending drivers they submitted
CREATE POLICY "Managers can view own pending drivers"
    ON pending_drivers FOR SELECT
    USING (
        is_manager(auth.uid()) = TRUE AND
        (submitted_by = auth.uid() OR submitted_by IS NULL)
    );

-- Super Admin can view all pending drivers
CREATE POLICY "Super Admin can view all pending drivers"
    ON pending_drivers FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can update pending drivers (for approval/rejection)
CREATE POLICY "Super Admin can update pending drivers"
    ON pending_drivers FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Comments
COMMENT ON TABLE pending_drivers IS 'Temporary storage for driver applications pending Super Admin approval';
COMMENT ON COLUMN pending_drivers.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN pending_drivers.submitted_by IS 'Manager who submitted the driver application';
COMMENT ON COLUMN pending_drivers.approved_by IS 'Super admin who approved/rejected the application';
