-- ============================================================================
-- Allow Managers to Insert Driver Records
-- ============================================================================
-- This migration adds RLS policies to allow managers to create driver records
-- when adding new drivers through the manager console.
-- ============================================================================

-- Allow managers to insert driver profiles
CREATE POLICY "Managers can insert driver profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        is_manager(auth.uid()) = TRUE AND
        EXISTS (
            SELECT 1
            FROM roles
            WHERE id = role_id AND name = 'driver'
        )
    );

-- Allow managers to insert driver records
CREATE POLICY "Managers can insert driver records"
    ON drivers FOR INSERT
    WITH CHECK (
        is_manager(auth.uid()) = TRUE
    );
