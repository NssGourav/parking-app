-- ============================================================================
-- Transactions System Database Schema Migration
-- ============================================================================
-- This migration creates the transactions table for the Parking App
-- Tracks all payment transactions for parking sessions
-- Includes Row-Level Security (RLS) policies for role-based access control
-- ============================================================================

-- ============================================================================
-- 1. TRANSACTIONS TABLE
-- ============================================================================
-- Stores all payment transactions for parking services
-- Links to users, vehicles, and sites
-- Supports multiple payment methods: UPI, Netbanking, Credit/Debit Card, Cash

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    parking_session_id UUID, -- Will reference parking_sessions table in future migration
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    base_rate DECIMAL(10, 2) NOT NULL CHECK (base_rate >= 0),
    service_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
    gst DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (gst >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'netbanking', 'card', 'cash')),
    
    -- Transaction Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Payment Gateway Details (nullable for cash payments)
    payment_id TEXT, -- Payment gateway transaction ID (e.g., Razorpay, Stripe)
    payment_reference TEXT, -- UPI reference, bank reference, etc.
    gateway_response JSONB, -- Full gateway response for debugging/audit
    
    -- Refund Information
    refund_id TEXT,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vehicle_id ON transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transactions_site_id ON transactions(site_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status) WHERE status IN ('completed', 'pending');
CREATE INDEX IF NOT EXISTS idx_transactions_site_created ON transactions(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id) WHERE payment_id IS NOT NULL;

-- Composite index for manager revenue queries
CREATE INDEX IF NOT EXISTS idx_transactions_site_status_created ON transactions(site_id, status, created_at DESC) WHERE status = 'completed';

-- Trigger to auto-update updated_at for transactions
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user owns a transaction
CREATE OR REPLACE FUNCTION is_transaction_owner(transaction_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM transactions
            WHERE id = transaction_id AND user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total revenue for a site (for managers)
CREATE OR REPLACE FUNCTION get_site_revenue(site_id_param UUID, start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL, end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_revenue DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM transactions
    WHERE site_id = site_id_param
    AND status = 'completed'
    AND (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date);
    
    RETURN total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total spending
CREATE OR REPLACE FUNCTION get_user_total_spending(user_id_param UUID)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE user_id = user_id_param AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's revenue for a site
CREATE OR REPLACE FUNCTION get_site_today_revenue(site_id_param UUID)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE site_id = site_id_param
        AND status = 'completed'
        AND DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get transaction count by status for a site
CREATE OR REPLACE FUNCTION get_site_transaction_stats(site_id_param UUID)
RETURNS TABLE (
    total_count BIGINT,
    completed_count BIGINT,
    pending_count BIGINT,
    failed_count BIGINT,
    total_revenue DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_count,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_revenue
    FROM transactions
    WHERE site_id = site_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: TRANSACTIONS TABLE
-- ============================================================================

-- Users can SELECT their own transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Users can INSERT their own transactions (when making payment)
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Users can UPDATE their own pending transactions (e.g., retry payment)
CREATE POLICY "Users can update own pending transactions"
    ON transactions FOR UPDATE
    USING (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user' AND
        status = 'pending'
    )
    WITH CHECK (
        user_id = auth.uid() AND
        get_user_role(auth.uid()) = 'user'
    );

-- Drivers: No direct access to transactions
-- (They will access transaction info through parking_sessions in future migrations)

-- Managers can SELECT transactions for their assigned sites
CREATE POLICY "Managers can view transactions at assigned sites"
    ON transactions FOR SELECT
    USING (
        is_manager(auth.uid()) = TRUE AND
        EXISTS (
            SELECT 1
            FROM manager_sites
            WHERE manager_id = auth.uid() AND site_id = transactions.site_id
        )
    );

-- Super Admin can SELECT all transactions
CREATE POLICY "Super Admin can view all transactions"
    ON transactions FOR SELECT
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can INSERT transactions (for manual entries, corrections)
CREATE POLICY "Super Admin can insert transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can UPDATE all transactions
CREATE POLICY "Super Admin can update all transactions"
    ON transactions FOR UPDATE
    USING (
        is_super_admin(auth.uid()) = TRUE
    )
    WITH CHECK (
        is_super_admin(auth.uid()) = TRUE
    );

-- Super Admin can DELETE transactions (for data cleanup)
CREATE POLICY "Super Admin can delete transactions"
    ON transactions FOR DELETE
    USING (
        is_super_admin(auth.uid()) = TRUE
    );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE transactions IS 'Stores all payment transactions for parking services';
COMMENT ON COLUMN transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN transactions.user_id IS 'References profiles.id - the user who made the payment';
COMMENT ON COLUMN transactions.vehicle_id IS 'References vehicles.id - the vehicle being parked';
COMMENT ON COLUMN transactions.site_id IS 'References sites.id - the parking location';
COMMENT ON COLUMN transactions.parking_session_id IS 'Will reference parking_sessions.id in future migration';
COMMENT ON COLUMN transactions.amount IS 'Total amount paid (base_rate + service_fee + gst)';
COMMENT ON COLUMN transactions.base_rate IS 'Base parking rate';
COMMENT ON COLUMN transactions.service_fee IS 'Service fee charged';
COMMENT ON COLUMN transactions.gst IS 'GST amount (18% typically)';
COMMENT ON COLUMN transactions.payment_method IS 'Payment method: upi, netbanking, card, or cash';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, completed, failed, refunded, or cancelled';
COMMENT ON COLUMN transactions.payment_id IS 'Payment gateway transaction ID (e.g., Razorpay, Stripe)';
COMMENT ON COLUMN transactions.payment_reference IS 'UPI reference, bank reference, or cash receipt number';
COMMENT ON COLUMN transactions.gateway_response IS 'Full payment gateway response JSON for audit/debugging';
COMMENT ON COLUMN transactions.refund_id IS 'Refund transaction ID if transaction was refunded';
COMMENT ON COLUMN transactions.refund_amount IS 'Amount refunded (may be partial)';
COMMENT ON COLUMN transactions.refund_reason IS 'Reason for refund';
COMMENT ON COLUMN transactions.completed_at IS 'Timestamp when payment was completed';
COMMENT ON COLUMN transactions.failed_at IS 'Timestamp when payment failed';
