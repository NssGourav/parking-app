-- ============================================================================
-- FORCE DELETE All Active Parking Sessions
-- ============================================================================
-- This will completely remove all active parking sessions
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Option 1: Delete all active sessions (RECOMMENDED)
DELETE FROM parking_sessions 
WHERE status = 'active';

-- Option 2: If Option 1 doesn't work, delete ALL sessions for your user
-- First, find your user ID:
-- SELECT id, email FROM auth.users;

-- Then delete sessions for that user (replace YOUR_USER_ID):
-- DELETE FROM parking_sessions WHERE user_id = 'YOUR_USER_ID';

-- Option 3: Nuclear option - delete ALL parking sessions (use with caution!)
-- DELETE FROM parking_sessions;

-- Verify the deletion worked:
SELECT * FROM parking_sessions WHERE status = 'active';
-- Should return 0 rows

-- Check all sessions:
SELECT id, user_id, status, created_at FROM parking_sessions ORDER BY created_at DESC LIMIT 10;
