-- ============================================
-- Migration: Create Pickup Zones Table
-- Description: Organize pickup areas by zones (e.g., Elementary Zone, Middle School Zone)
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 3 (Optional Features)
-- ============================================

-- ============================================
-- 1. Create pickup_zones table
-- ============================================

CREATE TABLE IF NOT EXISTS pickup_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    zone_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    location TEXT,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    color_code VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add check constraint for capacity
-- ============================================

ALTER TABLE pickup_zones
    DROP CONSTRAINT IF EXISTS check_zone_capacity;

ALTER TABLE pickup_zones
    ADD CONSTRAINT check_zone_capacity
    CHECK (capacity IS NULL OR capacity > 0);

-- ============================================
-- 3. Add check constraint for color_code format
-- ============================================

ALTER TABLE pickup_zones
    DROP CONSTRAINT IF EXISTS check_zone_color_format;

ALTER TABLE pickup_zones
    ADD CONSTRAINT check_zone_color_format
    CHECK (color_code IS NULL OR color_code ~ '^#[0-9A-Fa-f]{6}$');

-- ============================================
-- 4. Add zone_id column to classes table
-- ============================================

ALTER TABLE classes
    ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES pickup_zones(id) ON DELETE SET NULL;

-- ============================================
-- 5. Create indexes for performance
-- ============================================

-- Index for active zones ordered by display_order
CREATE INDEX IF NOT EXISTS idx_pickup_zones_active_order
    ON pickup_zones(display_order, zone_name)
    WHERE is_active = TRUE;

-- Index for zone code lookup
CREATE INDEX IF NOT EXISTS idx_pickup_zones_code
    ON pickup_zones(zone_code)
    WHERE is_active = TRUE;

-- Index for finding classes by zone
CREATE INDEX IF NOT EXISTS idx_classes_zone
    ON classes(zone_id)
    WHERE is_active = TRUE;

-- ============================================
-- 6. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_pickup_zones_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pickup_zones_timestamp ON pickup_zones;

CREATE TRIGGER trigger_update_pickup_zones_timestamp
    BEFORE UPDATE ON pickup_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_pickup_zones_timestamp();

-- ============================================
-- 7. Create function to get zone statistics
-- ============================================

CREATE OR REPLACE FUNCTION get_zone_statistics(p_zone_id UUID)
RETURNS TABLE (
    zone_id UUID,
    zone_name VARCHAR(100),
    total_classes INTEGER,
    total_students BIGINT,
    active_pickups_today BIGINT,
    zone_capacity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pz.id,
        pz.zone_name,
        COUNT(DISTINCT c.id)::INTEGER AS total_classes,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE
            WHEN pr.status = 'approved'
            AND DATE(pr.requested_time) = CURRENT_DATE
            THEN pr.id
        END) AS active_pickups_today,
        pz.capacity
    FROM pickup_zones pz
    LEFT JOIN classes c ON pz.id = c.zone_id AND c.is_active = TRUE
    LEFT JOIN students s ON c.id = s.class_id AND s.is_active = TRUE
    LEFT JOIN pickup_requests pr ON s.id = pr.student_id
    WHERE pz.id = p_zone_id
    AND pz.is_active = TRUE
    GROUP BY pz.id, pz.zone_name, pz.capacity;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Create function to get all active zones with stats
-- ============================================

CREATE OR REPLACE FUNCTION get_all_zones_with_stats()
RETURNS TABLE (
    zone_id UUID,
    zone_name VARCHAR(100),
    zone_code VARCHAR(20),
    description TEXT,
    location TEXT,
    capacity INTEGER,
    color_code VARCHAR(7),
    total_classes BIGINT,
    total_students BIGINT,
    active_pickups_today BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pz.id,
        pz.zone_name,
        pz.zone_code,
        pz.description,
        pz.location,
        pz.capacity,
        pz.color_code,
        COUNT(DISTINCT c.id) AS total_classes,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE
            WHEN pr.status = 'approved'
            AND DATE(pr.requested_time) = CURRENT_DATE
            THEN pr.id
        END) AS active_pickups_today
    FROM pickup_zones pz
    LEFT JOIN classes c ON pz.id = c.zone_id AND c.is_active = TRUE
    LEFT JOIN students s ON c.id = s.class_id AND s.is_active = TRUE
    LEFT JOIN pickup_requests pr ON s.id = pr.student_id
    WHERE pz.is_active = TRUE
    GROUP BY pz.id, pz.zone_name, pz.zone_code, pz.description, pz.location, pz.capacity, pz.color_code
    ORDER BY pz.display_order, pz.zone_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Insert default zones (examples)
-- ============================================

INSERT INTO pickup_zones (zone_name, zone_code, description, location, capacity, display_order, color_code)
VALUES
    ('Elementary Zone', 'ELEM', 'Pickup area for grades K-5', 'West Entrance, Building A', 20, 1, '#4CAF50'),
    ('Middle School Zone', 'MIDDLE', 'Pickup area for grades 6-8', 'East Entrance, Building B', 15, 2, '#2196F3'),
    ('High School Zone', 'HIGH', 'Pickup area for grades 9-12', 'Main Entrance, Building C', 25, 3, '#FF9800')
ON CONFLICT (zone_name) DO NOTHING;

-- ============================================
-- 10. Add comments for documentation
-- ============================================

COMMENT ON TABLE pickup_zones IS 'Pickup zones for organizing pickup areas by grade/location';
COMMENT ON COLUMN pickup_zones.zone_name IS 'Name of the pickup zone';
COMMENT ON COLUMN pickup_zones.zone_code IS 'Short code for the zone (e.g., ELEM, MIDDLE)';
COMMENT ON COLUMN pickup_zones.description IS 'Description of what this zone is for';
COMMENT ON COLUMN pickup_zones.location IS 'Physical location of this pickup zone';
COMMENT ON COLUMN pickup_zones.capacity IS 'Maximum number of concurrent pickups in this zone';
COMMENT ON COLUMN pickup_zones.display_order IS 'Order in which zones are displayed (lower = first)';
COMMENT ON COLUMN pickup_zones.color_code IS 'Hex color code for visual identification (e.g., #FF5733)';
COMMENT ON COLUMN classes.zone_id IS 'Pickup zone assigned to this class';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 019 completed successfully';
    RAISE NOTICE '📊 Created pickup_zones table (OPTIONAL feature)';
    RAISE NOTICE '🔧 Created functions:';
    RAISE NOTICE '   - get_zone_statistics(zone_id)';
    RAISE NOTICE '   - get_all_zones_with_stats()';
    RAISE NOTICE '📍 Added zone_id column to classes table';
    RAISE NOTICE '🎨 Inserted 3 default zones:';
    RAISE NOTICE '   - Elementary Zone (ELEM) - Green';
    RAISE NOTICE '   - Middle School Zone (MIDDLE) - Blue';
    RAISE NOTICE '   - High School Zone (HIGH) - Orange';
    RAISE NOTICE 'ℹ️  Zones help organize pickup by grade level/location';
    RAISE NOTICE 'ℹ️  Guards can see which zone each student belongs to';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
ALTER TABLE classes DROP COLUMN IF EXISTS zone_id;
DROP TRIGGER IF EXISTS trigger_update_pickup_zones_timestamp ON pickup_zones;
DROP FUNCTION IF EXISTS update_pickup_zones_timestamp();
DROP FUNCTION IF EXISTS get_zone_statistics(UUID);
DROP FUNCTION IF EXISTS get_all_zones_with_stats();
DROP TABLE IF EXISTS pickup_zones CASCADE;
*/
