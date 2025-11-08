-- ============================================
-- Migration: Create Vehicles Table
-- Description: Optional vehicle registration for parents (faster gate verification)
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 3 (Optional Features)
-- ============================================

-- ============================================
-- 1. Create vehicles table
-- ============================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    license_plate VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add check constraint for year
-- ============================================

ALTER TABLE vehicles
    DROP CONSTRAINT IF EXISTS check_vehicle_year;

ALTER TABLE vehicles
    ADD CONSTRAINT check_vehicle_year
    CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1));

-- ============================================
-- 3. Add check constraint for license plate format
-- ============================================

ALTER TABLE vehicles
    DROP CONSTRAINT IF EXISTS check_license_plate_format;

ALTER TABLE vehicles
    ADD CONSTRAINT check_license_plate_format
    CHECK (license_plate ~ '^[A-Z0-9\-]+$' AND LENGTH(license_plate) >= 3);

-- ============================================
-- 4. Create indexes for performance
-- ============================================

-- Index for finding vehicles by owner
CREATE INDEX IF NOT EXISTS idx_vehicles_owner
    ON vehicles(owner_user_id, is_active)
    WHERE is_active = TRUE;

-- Index for license plate lookups (guard searches)
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate
    ON vehicles(license_plate);

-- Unique constraint on active license plates
DROP INDEX IF EXISTS idx_vehicles_unique_active_plate;

CREATE UNIQUE INDEX idx_vehicles_unique_active_plate
    ON vehicles(license_plate)
    WHERE is_active = TRUE;

-- ============================================
-- 5. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_vehicles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vehicles_timestamp ON vehicles;

CREATE TRIGGER trigger_update_vehicles_timestamp
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicles_timestamp();

-- ============================================
-- 6. Create function to search vehicle by license plate
-- ============================================

CREATE OR REPLACE FUNCTION search_vehicle_by_plate(p_license_plate VARCHAR(20))
RETURNS TABLE (
    vehicle_id UUID,
    owner_id UUID,
    owner_name TEXT,
    vehicle_info TEXT,
    license_plate VARCHAR(20),
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.owner_user_id,
        u.full_name,
        COALESCE(v.make || ' ' || v.model || ' ' || COALESCE(v.year::TEXT, ''), 'Vehicle') AS vehicle_info,
        v.license_plate,
        v.is_active
    FROM vehicles v
    JOIN users u ON v.owner_user_id = u.id
    WHERE UPPER(v.license_plate) = UPPER(p_license_plate)
    AND v.is_active = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create function to get user's vehicles
-- ============================================

CREATE OR REPLACE FUNCTION get_user_vehicles(p_user_id UUID)
RETURNS TABLE (
    vehicle_id UUID,
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    license_plate VARCHAR(20),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.make,
        v.model,
        v.year,
        v.color,
        v.license_plate,
        v.is_active,
        v.created_at
    FROM vehicles v
    WHERE v.owner_user_id = p_user_id
    AND v.is_active = TRUE
    ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Add comments for documentation
-- ============================================

COMMENT ON TABLE vehicles IS 'Optional vehicle registration for parents (not required)';
COMMENT ON COLUMN vehicles.owner_user_id IS 'Parent/guardian who owns this vehicle';
COMMENT ON COLUMN vehicles.make IS 'Vehicle manufacturer (e.g., Toyota, Honda)';
COMMENT ON COLUMN vehicles.model IS 'Vehicle model (e.g., Camry, Civic)';
COMMENT ON COLUMN vehicles.year IS 'Vehicle year (optional)';
COMMENT ON COLUMN vehicles.color IS 'Vehicle color for easy identification';
COMMENT ON COLUMN vehicles.license_plate IS 'License plate number (uppercase)';
COMMENT ON COLUMN vehicles.is_active IS 'Whether this vehicle is still in use';
COMMENT ON COLUMN vehicles.notes IS 'Additional notes about the vehicle';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 017 completed successfully';
    RAISE NOTICE '📊 Created vehicles table (OPTIONAL feature)';
    RAISE NOTICE '🔧 Created functions:';
    RAISE NOTICE '   - search_vehicle_by_plate(license_plate)';
    RAISE NOTICE '   - get_user_vehicles(user_id)';
    RAISE NOTICE 'ℹ️  Parents can OPTIONALLY register their vehicles';
    RAISE NOTICE 'ℹ️  Guards can search by license plate for quick verification';
    RAISE NOTICE 'ℹ️  Example: Guard sees plate "ABC-123", searches, finds parent info';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_vehicles_timestamp ON vehicles;
DROP FUNCTION IF EXISTS update_vehicles_timestamp();
DROP FUNCTION IF EXISTS search_vehicle_by_plate(VARCHAR);
DROP FUNCTION IF EXISTS get_user_vehicles(UUID);
DROP TABLE IF EXISTS vehicles CASCADE;
*/
