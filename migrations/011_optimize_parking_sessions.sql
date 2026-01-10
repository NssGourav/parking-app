-- ============================================================================
-- Performance Optimization for Parking Sessions
-- ============================================================================
-- 1. Adds missing indexes for faster lookups and updates
-- 2. Creates a consolidated RPC function for starting a parking session
-- ============================================================================

-- Add index on user_id for parking_sessions (Crucial for cleanup query)
CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_id ON parking_sessions(user_id);

-- Add composite index for active sessions lookup
CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_status_active 
ON parking_sessions(user_id, status) 
WHERE status IN ('active', 'retrieving');

-- RPC function to handle the entire parking flow in a single transaction
-- This reduces network round-trips from 3-4 down to 1.
CREATE OR REPLACE FUNCTION start_parking_session_v1(
    p_user_id UUID,
    p_vehicle_id UUID,
    p_site_id UUID,
    p_vehicle_number TEXT,
    p_vehicle_model TEXT,
    p_payment_method TEXT,
    p_amount DECIMAL,
    p_base_rate DECIMAL,
    p_service_fee DECIMAL,
    p_gst DECIMAL
) RETURNS JSON AS $$
DECLARE
    v_session_id UUID;
    v_new_session RECORD;
BEGIN
    -- 1. Complete any existing sessions for this user (Cleanup)
    UPDATE parking_sessions
    SET status = 'completed', exit_time = NOW()
    WHERE user_id = p_user_id AND status IN ('active', 'retrieving');

    -- 2. Insert new session
    INSERT INTO parking_sessions (
        user_id, vehicle_id, site_id, vehicle_number, 
        vehicle_model, vehicle_type, entry_time, status
    ) VALUES (
        p_user_id, p_vehicle_id, p_site_id, p_vehicle_number,
        p_vehicle_model, 'car', NOW(), 'active'
    ) RETURNING id INTO v_session_id;

    -- 3. Insert transaction
    INSERT INTO transactions (
        user_id, vehicle_id, site_id, parking_session_id,
        amount, base_rate, service_fee, gst,
        payment_method, status, completed_at
    ) VALUES (
        p_user_id, p_vehicle_id, p_site_id, v_session_id,
        p_amount, p_base_rate, p_service_fee, p_gst,
        p_payment_method, 'completed', NOW()
    );

    -- 4. Get the full session record to return
    SELECT * INTO v_new_session FROM parking_sessions WHERE id = v_session_id;

    RETURN row_to_json(v_new_session);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
