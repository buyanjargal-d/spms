import { AppDataSource } from '../config/database';

async function runMigration() {
  try {
    console.log('🔧 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    console.log('🔧 Running migration...');
    await AppDataSource.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

    console.log('✅ Migration completed successfully');
    console.log('🔐 Added password column to users table');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigration();
