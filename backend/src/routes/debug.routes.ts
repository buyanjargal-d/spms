import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';

const router = Router();

/**
 * DEBUG ROUTES - Remove in production!
 * These routes help diagnose database issues
 */

/**
 * @route   GET /api/v1/debug/database-stats
 * @desc    Check database statistics
 * @access  Public (REMOVE IN PRODUCTION!)
 */
router.get('/database-stats', async (_req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();

    // Count users by type
    const userStats = await queryRunner.query(`
      SELECT
        CASE WHEN dan_id LIKE 'TEST%' THEN 'TEST DATA' ELSE 'REAL DATA' END as data_type,
        role,
        COUNT(*) as count
      FROM users
      GROUP BY data_type, role
      ORDER BY data_type, role
    `);

    // Get recent users
    const recentUsers = await queryRunner.query(`
      SELECT dan_id, full_name, role, email, created_at,
             CASE WHEN dan_id LIKE 'TEST%' THEN 'TEST' ELSE 'REAL' END as type
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Count students
    const studentStats = await queryRunner.query(`
      SELECT
        CASE WHEN student_code LIKE 'STU%' THEN 'TEST DATA' ELSE 'REAL DATA' END as data_type,
        COUNT(*) as count
      FROM students
      GROUP BY data_type
    `);

    // Count pickup requests
    const requestStats = await queryRunner.query(`
      SELECT status, COUNT(*) as count
      FROM pickup_requests
      GROUP BY status
    `);

    await queryRunner.release();

    res.json({
      success: true,
      database: AppDataSource.options.database,
      stats: {
        users: userStats,
        students: studentStats,
        pickupRequests: requestStats,
      },
      recentUsers: recentUsers,
      message: 'Database connection is working correctly'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to query database'
    });
  }
});

/**
 * @route   GET /api/v1/debug/clear-test-data
 * @desc    Clear all TEST data from database
 * @access  Public (REMOVE IN PRODUCTION!)
 */
router.delete('/clear-test-data', async (_req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Delete in order respecting foreign keys
      await queryRunner.query(`DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%')`);
      await queryRunner.query(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%')`);
      await queryRunner.query(`DELETE FROM guest_pickup_approvals WHERE pickup_request_id IN (SELECT id FROM pickup_requests WHERE requester_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%'))`);
      await queryRunner.query(`DELETE FROM pickup_requests WHERE requester_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%')`);
      await queryRunner.query(`DELETE FROM student_guardians WHERE guardian_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%')`);
      await queryRunner.query(`DELETE FROM students WHERE student_code LIKE 'STU%'`);
      await queryRunner.query(`DELETE FROM classes WHERE teacher_id IN (SELECT id FROM users WHERE dan_id LIKE 'TEST%')`);

      const deleteResult = await queryRunner.query(`DELETE FROM users WHERE dan_id LIKE 'TEST%'`);

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        message: 'Test data cleared successfully',
        deletedUsers: deleteResult[1] // Number of deleted rows
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to clear test data'
    });
  }
});

export default router;
