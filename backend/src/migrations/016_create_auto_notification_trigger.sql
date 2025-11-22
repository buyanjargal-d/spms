-- ============================================
-- Migration: Create Auto-Notification Trigger
-- Description: Automatically create notifications when pickup request status changes
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 2 (Enhanced Features)
-- ============================================

-- ============================================
-- 1. Create function to notify all student guardians
-- ============================================

CREATE OR REPLACE FUNCTION notify_student_guardians(
    p_student_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_notification_type VARCHAR(50),
    p_request_id UUID
)
RETURNS VOID AS $$
DECLARE
    guardian_record RECORD;
BEGIN
    -- Loop through all authorized guardians of the student
    FOR guardian_record IN
        SELECT DISTINCT u.id as guardian_id
        FROM users u
        JOIN student_guardians sg ON u.id = sg.guardian_id
        WHERE sg.student_id = p_student_id
        AND sg.is_authorized = TRUE
        AND u.is_active = TRUE
    LOOP
        -- Create notification for each guardian
        INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type,
            related_request_id,
            is_read,
            created_at
        ) VALUES (
            guardian_record.guardian_id,
            p_title,
            p_message,
            p_notification_type,
            p_request_id,
            FALSE,
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Create main auto-notification trigger function
-- ============================================

CREATE OR REPLACE FUNCTION auto_create_pickup_notification()
RETURNS TRIGGER AS $$
DECLARE
    student_name TEXT;
    requester_name TEXT;
    pickup_time TEXT;
BEGIN
    -- Get student name
    SELECT first_name || ' ' || last_name INTO student_name
    FROM students WHERE id = NEW.student_id;

    -- Get requester name
    SELECT full_name INTO requester_name
    FROM users WHERE id = NEW.requester_id;

    -- Format pickup time
    pickup_time := TO_CHAR(NEW.requested_time, 'HH24:MI');

    -- Handle INSERT (new request created)
    IF TG_OP = 'INSERT' THEN
        -- Notify the requester that request was created
        INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type,
            related_request_id,
            is_read,
            created_at
        ) VALUES (
            NEW.requester_id,
            'Pickup Request Created',
            'Your pickup request for ' || student_name || ' at ' || pickup_time || ' has been submitted and is pending approval.',
            'pickup_request_created',
            NEW.id,
            FALSE,
            NOW()
        );

    -- Handle UPDATE (status change)
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN

        -- Status changed to APPROVED
        IF NEW.status = 'approved' THEN
            -- Notify requester
            INSERT INTO notifications (
                user_id,
                title,
                message,
                notification_type,
                related_request_id,
                is_read,
                created_at
            ) VALUES (
                NEW.requester_id,
                'Pickup Request Approved',
                'Your pickup request for ' || student_name || ' at ' || pickup_time || ' has been approved. QR Code: ' || COALESCE(NEW.qr_code, 'Generating...'),
                'pickup_request_approved',
                NEW.id,
                FALSE,
                NOW()
            );

            -- Notify all guardians (if requester is not the only guardian)
            PERFORM notify_student_guardians(
                NEW.student_id,
                'Pickup Request Approved',
                'A pickup request for ' || student_name || ' by ' || requester_name || ' at ' || pickup_time || ' has been approved.',
                'pickup_request_approved',
                NEW.id
            );

        -- Status changed to REJECTED
        ELSIF NEW.status = 'rejected' THEN
            -- Notify requester with rejection reason
            INSERT INTO notifications (
                user_id,
                title,
                message,
                notification_type,
                related_request_id,
                is_read,
                created_at
            ) VALUES (
                NEW.requester_id,
                'Pickup Request Rejected',
                'Your pickup request for ' || student_name || ' at ' || pickup_time || ' has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'),
                'pickup_request_rejected',
                NEW.id,
                FALSE,
                NOW()
            );

        -- Status changed to COMPLETED
        ELSIF NEW.status = 'completed' THEN
            -- Notify all guardians that pickup was completed
            PERFORM notify_student_guardians(
                NEW.student_id,
                'Pickup Completed',
                student_name || ' has been picked up at ' || TO_CHAR(NEW.actual_pickup_time, 'HH24:MI') || '.',
                'pickup_completed',
                NEW.id
            );

        -- Status changed to CANCELLED
        ELSIF NEW.status = 'cancelled' THEN
            -- Notify all guardians that request was cancelled
            PERFORM notify_student_guardians(
                NEW.student_id,
                'Pickup Request Cancelled',
                'The pickup request for ' || student_name || ' at ' || pickup_time || ' has been cancelled by ' || requester_name || '.',
                'pickup_completed',
                NEW.id
            );

        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Drop existing trigger if exists
-- ============================================

DROP TRIGGER IF EXISTS trigger_auto_create_pickup_notification ON pickup_requests;

-- ============================================
-- 4. Create the trigger
-- ============================================

CREATE TRIGGER trigger_auto_create_pickup_notification
    AFTER INSERT OR UPDATE OF status ON pickup_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_pickup_notification();

-- ============================================
-- 5. Create function to manually send notification
-- ============================================

CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_notification_type VARCHAR(50) DEFAULT 'system_announcement',
    p_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        notification_type,
        related_request_id,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_notification_type,
        p_request_id,
        FALSE,
        NOW()
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create function to broadcast notification to all users
-- ============================================

CREATE OR REPLACE FUNCTION broadcast_notification(
    p_title VARCHAR(255),
    p_message TEXT,
    p_notification_type VARCHAR(50) DEFAULT 'system_announcement'
)
RETURNS INTEGER AS $$
DECLARE
    notification_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Send to all active users
    FOR user_record IN
        SELECT id FROM users WHERE is_active = TRUE
    LOOP
        PERFORM send_notification(
            user_record.id,
            p_title,
            p_message,
            p_notification_type
        );
        notification_count := notification_count + 1;
    END LOOP;

    RETURN notification_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Add comments for documentation
-- ============================================

COMMENT ON FUNCTION auto_create_pickup_notification() IS 'Automatically creates notifications when pickup request status changes';
COMMENT ON FUNCTION notify_student_guardians(UUID, VARCHAR, TEXT, VARCHAR, UUID) IS 'Sends notification to all authorized guardians of a student';
COMMENT ON FUNCTION send_notification(UUID, VARCHAR, TEXT, VARCHAR, UUID) IS 'Manually send a notification to a specific user';
COMMENT ON FUNCTION broadcast_notification(VARCHAR, TEXT, VARCHAR) IS 'Send a notification to all active users (e.g., system announcements)';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 016 completed successfully';
    RAISE NOTICE 'Created auto-notification trigger system';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '   - auto_create_pickup_notification() (trigger)';
    RAISE NOTICE '   - notify_student_guardians()';
    RAISE NOTICE '   - send_notification()';
    RAISE NOTICE '   - broadcast_notification()';
    RAISE NOTICE 'INFO: Notifications will now be automatically created when:';
    RAISE NOTICE '   - New pickup request is created';
    RAISE NOTICE '   - Request is approved';
    RAISE NOTICE '   - Request is rejected';
    RAISE NOTICE '   - Pickup is completed';
    RAISE NOTICE '   - Request is cancelled';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_auto_create_pickup_notification ON pickup_requests;
DROP FUNCTION IF EXISTS auto_create_pickup_notification();
DROP FUNCTION IF EXISTS notify_student_guardians(UUID, VARCHAR, TEXT, VARCHAR, UUID);
DROP FUNCTION IF EXISTS send_notification(UUID, VARCHAR, TEXT, VARCHAR, UUID);
DROP FUNCTION IF EXISTS broadcast_notification(VARCHAR, TEXT, VARCHAR);
*/
