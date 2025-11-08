-- ============================================
-- Migration: Create Emergency Contacts Table
-- Description: Additional emergency contacts for students (beyond parents)
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 3 (Optional Features)
-- ============================================

-- ============================================
-- 1. Create emergency_contacts table
-- ============================================

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add check constraint for priority
-- ============================================

ALTER TABLE emergency_contacts
    DROP CONSTRAINT IF EXISTS check_emergency_contact_priority;

ALTER TABLE emergency_contacts
    ADD CONSTRAINT check_emergency_contact_priority
    CHECK (priority >= 1 AND priority <= 10);

-- ============================================
-- 3. Add check constraint for relationship
-- ============================================

ALTER TABLE emergency_contacts
    DROP CONSTRAINT IF EXISTS check_emergency_contact_relationship;

ALTER TABLE emergency_contacts
    ADD CONSTRAINT check_emergency_contact_relationship
    CHECK (relationship IN ('Grandparent', 'Aunt', 'Uncle', 'Sibling', 'Family Friend', 'Neighbor', 'Other'));

-- ============================================
-- 4. Create indexes for performance
-- ============================================

-- Index for finding contacts by student
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_student
    ON emergency_contacts(student_id, is_active, priority)
    WHERE is_active = TRUE;

-- Index for phone number search
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_phone
    ON emergency_contacts(phone)
    WHERE is_active = TRUE;

-- ============================================
-- 5. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_emergency_contacts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_emergency_contacts_timestamp ON emergency_contacts;

CREATE TRIGGER trigger_update_emergency_contacts_timestamp
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_emergency_contacts_timestamp();

-- ============================================
-- 6. Create function to get student's emergency contacts
-- ============================================

CREATE OR REPLACE FUNCTION get_student_emergency_contacts(p_student_id UUID)
RETURNS TABLE (
    contact_id UUID,
    full_name VARCHAR(100),
    relationship VARCHAR(50),
    phone VARCHAR(20),
    alternative_phone VARCHAR(20),
    email VARCHAR(100),
    priority INTEGER,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ec.id,
        ec.full_name,
        ec.relationship,
        ec.phone,
        ec.alternative_phone,
        ec.email,
        ec.priority,
        ec.notes
    FROM emergency_contacts ec
    WHERE ec.student_id = p_student_id
    AND ec.is_active = TRUE
    ORDER BY ec.priority ASC, ec.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create function to search contact by phone
-- ============================================

CREATE OR REPLACE FUNCTION search_emergency_contact_by_phone(p_phone VARCHAR(20))
RETURNS TABLE (
    contact_id UUID,
    student_id UUID,
    student_name TEXT,
    contact_name VARCHAR(100),
    relationship VARCHAR(50),
    phone VARCHAR(20),
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ec.id,
        ec.student_id,
        s.first_name || ' ' || s.last_name AS student_name,
        ec.full_name,
        ec.relationship,
        ec.phone,
        ec.priority
    FROM emergency_contacts ec
    JOIN students s ON ec.student_id = s.id
    WHERE ec.phone = p_phone
    AND ec.is_active = TRUE
    ORDER BY ec.priority ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Add comments for documentation
-- ============================================

COMMENT ON TABLE emergency_contacts IS 'Additional emergency contacts for students (beyond parents/guardians)';
COMMENT ON COLUMN emergency_contacts.student_id IS 'Student this emergency contact is for';
COMMENT ON COLUMN emergency_contacts.full_name IS 'Full name of emergency contact';
COMMENT ON COLUMN emergency_contacts.relationship IS 'Relationship to student (Grandparent, Aunt, Uncle, etc.)';
COMMENT ON COLUMN emergency_contacts.phone IS 'Primary phone number';
COMMENT ON COLUMN emergency_contacts.alternative_phone IS 'Alternative/backup phone number';
COMMENT ON COLUMN emergency_contacts.priority IS 'Contact priority (1=highest, 10=lowest)';
COMMENT ON COLUMN emergency_contacts.is_active IS 'Whether this contact is still active';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 018 completed successfully';
    RAISE NOTICE '📊 Created emergency_contacts table (OPTIONAL feature)';
    RAISE NOTICE '🔧 Created functions:';
    RAISE NOTICE '   - get_student_emergency_contacts(student_id)';
    RAISE NOTICE '   - search_emergency_contact_by_phone(phone)';
    RAISE NOTICE 'ℹ️  Parents can add additional emergency contacts';
    RAISE NOTICE 'ℹ️  Contacts prioritized for emergency situations';
    RAISE NOTICE 'ℹ️  Example: Grandparents, aunts/uncles, family friends';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_emergency_contacts_timestamp ON emergency_contacts;
DROP FUNCTION IF EXISTS update_emergency_contacts_timestamp();
DROP FUNCTION IF EXISTS get_student_emergency_contacts(UUID);
DROP FUNCTION IF EXISTS search_emergency_contact_by_phone(VARCHAR);
DROP TABLE IF EXISTS emergency_contacts CASCADE;
*/
