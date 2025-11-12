import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Determine SSL configuration based on DATABASE_URL
// Supabase Transaction Pooler (port 6543) doesn't support SSL
// Local PostgreSQL (postgres:5432) doesn't support SSL
// Supabase Session Pooler (port 5432) requires SSL
const databaseUrl = process.env.DATABASE_URL || '';
const isTransactionPooler = databaseUrl.includes(':6543');
const isLocalPostgres = databaseUrl.includes('@postgres:5432') || databaseUrl.includes('@localhost:5432');

// Log SSL configuration for debugging
console.log('🔍 Database URL check:', {
  hasTransactionPooler: isTransactionPooler,
  hasLocalPostgres: isLocalPostgres,
  willUseSSL: !(isTransactionPooler || isLocalPostgres),
  urlPattern: databaseUrl.replace(/:[^:@]+@/, ':****@') // Hide password
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: (isTransactionPooler || isLocalPostgres) ? false : {
    rejectUnauthorized: false
  },
  synchronize: false, // NEVER use true in production
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../models/**/*.{ts,js}'],
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
  subscribers: [__dirname + '/../subscribers/**/*.{ts,js}'],
  extra: {
    max: 10, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database: ${AppDataSource.options.database || 'postgres'}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default AppDataSource;
