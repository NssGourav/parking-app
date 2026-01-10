-- ============================================================================
-- Dummy Data for Today's Performance
-- ============================================================================
-- This script adds sample parking sessions and transactions for today
-- to populate the Super Admin dashboard statistics
-- ============================================================================

-- Get today's date
DO $$
DECLARE
    today_date DATE := CURRENT_DATE;
    site1_id UUID;
    site2_id UUID;
    site3_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    driver1_id UUID;
BEGIN
    -- Get site IDs (assuming sites already exist from setup_test_profiles.sql)
    SELECT id INTO site1_id FROM sites WHERE name LIKE '%Inorbit%' LIMIT 1;
    SELECT id INTO site2_id FROM sites WHERE name LIKE '%Phoenix%' LIMIT 1;
    SELECT id INTO site3_id FROM sites WHERE name LIKE '%Infiniti%' LIMIT 1;
    
    -- Get user IDs for customers
    SELECT id INTO user1_id FROM profiles WHERE email = 'user@test.com';
    
    -- Create additional test users if needed
    IF user1_id IS NULL THEN
        RAISE NOTICE 'Test users not found. Please run setup_test_profiles.sql first.';
        RETURN;
    END IF;
    
    -- Get driver ID
    SELECT id INTO driver1_id FROM profiles WHERE email = 'driver@test.com';
    
    -- ========================================================================
    -- INORBIT MALL - Today's Data
    -- ========================================================================
    
    -- Completed sessions (87 tickets, ₹13,050 collection)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, exit_time, status, parking_fee
    ) VALUES
    -- Morning sessions (6 AM - 12 PM) - 30 tickets
    (site1_id, user1_id, driver1_id, 'MH01AB1234', 'car', 
     today_date + INTERVAL '6 hours', today_date + INTERVAL '8 hours', 'completed', 150),
    (site1_id, user1_id, driver1_id, 'MH01CD5678', 'car',
     today_date + INTERVAL '7 hours', today_date + INTERVAL '9 hours', 'completed', 150),
    (site1_id, user1_id, driver1_id, 'MH01EF9012', 'suv',
     today_date + INTERVAL '8 hours', today_date + INTERVAL '10 hours', 'completed', 200),
    (site1_id, user1_id, driver1_id, 'MH01GH3456', 'bike',
     today_date + INTERVAL '9 hours', today_date + INTERVAL '10 hours', 'completed', 50),
    (site1_id, user1_id, driver1_id, 'MH01IJ7890', 'car',
     today_date + INTERVAL '10 hours', today_date + INTERVAL '11 hours', 'completed', 150);
    
    -- Afternoon sessions (12 PM - 6 PM) - 42 tickets
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, exit_time, status, parking_fee
    ) 
    SELECT 
        site1_id, user1_id, driver1_id,
        'MH01' || chr(65 + (i % 26)) || chr(65 + ((i+1) % 26)) || LPAD((1000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '12 hours' + (i * INTERVAL '10 minutes'),
        today_date + INTERVAL '14 hours' + (i * INTERVAL '10 minutes'),
        'completed',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 42) AS i;
    
    -- Evening sessions (6 PM onwards) - 15 tickets
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, exit_time, status, parking_fee
    ) 
    SELECT 
        site1_id, user1_id, driver1_id,
        'MH01' || chr(65 + (i % 26)) || chr(65 + ((i+2) % 26)) || LPAD((2000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '18 hours' + (i * INTERVAL '15 minutes'),
        today_date + INTERVAL '19 hours' + (i * INTERVAL '15 minutes'),
        'completed',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 15) AS i;
    
    -- Active parking (45 vehicles currently parked)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, status, parking_fee
    ) 
    SELECT 
        site1_id, user1_id, driver1_id,
        'MH01' || chr(65 + (i % 26)) || chr(65 + ((i+3) % 26)) || LPAD((3000 + i)::TEXT, 4, '0'),
        CASE (i % 4) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' WHEN 2 THEN 'suv' ELSE 'car' END,
        today_date + INTERVAL '10 hours' + (i * INTERVAL '20 minutes'),
        'active',
        CASE (i % 4) WHEN 0 THEN 150 WHEN 1 THEN 50 WHEN 2 THEN 200 ELSE 150 END
    FROM generate_series(1, 45) AS i;
    
    -- ========================================================================
    -- PHOENIX MALL - Today's Data
    -- ========================================================================
    
    -- Completed sessions (65 tickets)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, exit_time, status, parking_fee
    ) 
    SELECT 
        site2_id, user1_id, driver1_id,
        'MH02' || chr(65 + (i % 26)) || chr(65 + ((i+1) % 26)) || LPAD((1000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '8 hours' + (i * INTERVAL '8 minutes'),
        today_date + INTERVAL '10 hours' + (i * INTERVAL '8 minutes'),
        'completed',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 65) AS i;
    
    -- Active parking (32 vehicles)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, status, parking_fee
    ) 
    SELECT 
        site2_id, user1_id, driver1_id,
        'MH02' || chr(65 + (i % 26)) || chr(65 + ((i+2) % 26)) || LPAD((2000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '11 hours' + (i * INTERVAL '15 minutes'),
        'active',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 32) AS i;
    
    -- ========================================================================
    -- INFINITI MALL - Today's Data
    -- ========================================================================
    
    -- Completed sessions (53 tickets)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, exit_time, status, parking_fee
    ) 
    SELECT 
        site3_id, user1_id, driver1_id,
        'MH03' || chr(65 + (i % 26)) || chr(65 + ((i+1) % 26)) || LPAD((1000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '9 hours' + (i * INTERVAL '7 minutes'),
        today_date + INTERVAL '11 hours' + (i * INTERVAL '7 minutes'),
        'completed',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 53) AS i;
    
    -- Active parking (28 vehicles)
    INSERT INTO parking_sessions (
        site_id, user_id, driver_id, vehicle_number, vehicle_type,
        entry_time, status, parking_fee
    ) 
    SELECT 
        site3_id, user1_id, driver1_id,
        'MH03' || chr(65 + (i % 26)) || chr(65 + ((i+2) % 26)) || LPAD((2000 + i)::TEXT, 4, '0'),
        CASE (i % 3) WHEN 0 THEN 'car' WHEN 1 THEN 'bike' ELSE 'suv' END,
        today_date + INTERVAL '12 hours' + (i * INTERVAL '12 minutes'),
        'active',
        CASE (i % 3) WHEN 0 THEN 150 WHEN 1 THEN 50 ELSE 200 END
    FROM generate_series(1, 28) AS i;
    
    -- ========================================================================
    -- CREATE TRANSACTIONS FOR COMPLETED SESSIONS
    -- ========================================================================
    
    -- Create transactions for all completed sessions
    INSERT INTO transactions (
        session_id, user_id, site_id, amount, payment_method, status
    )
    SELECT 
        ps.id,
        ps.user_id,
        ps.site_id,
        ps.parking_fee,
        CASE (RANDOM() * 3)::INT 
            WHEN 0 THEN 'cash'
            WHEN 1 THEN 'card'
            WHEN 2 THEN 'upi'
            ELSE 'wallet'
        END,
        'completed'
    FROM parking_sessions ps
    WHERE ps.status = 'completed'
    AND ps.entry_time >= today_date
    AND ps.entry_time < today_date + INTERVAL '1 day';
    
    RAISE NOTICE 'Dummy data created successfully!';
    RAISE NOTICE 'Total sessions created: %', (SELECT COUNT(*) FROM parking_sessions WHERE entry_time >= today_date);
    RAISE NOTICE 'Active parking: %', (SELECT COUNT(*) FROM parking_sessions WHERE status = ''active'' AND entry_time >= today_date);
    RAISE NOTICE 'Completed sessions: %', (SELECT COUNT(*) FROM parking_sessions WHERE status = ''completed'' AND entry_time >= today_date);
    
END $$;

-- ============================================================================
-- Summary Statistics
-- ============================================================================

-- Show summary by site
SELECT 
    s.name AS site_name,
    COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) AS today_tickets,
    COALESCE(SUM(CASE WHEN ps.status = 'completed' THEN t.amount END), 0) AS today_collection,
    COUNT(CASE WHEN ps.status = 'active' THEN 1 END) AS active_parking
FROM sites s
LEFT JOIN parking_sessions ps ON s.id = ps.site_id 
    AND ps.entry_time >= CURRENT_DATE 
    AND ps.entry_time < CURRENT_DATE + INTERVAL '1 day'
LEFT JOIN transactions t ON ps.id = t.session_id AND t.status = 'completed'
GROUP BY s.name
ORDER BY s.name;
