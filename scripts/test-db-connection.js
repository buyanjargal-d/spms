#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connection to Supabase PostgreSQL database
 */

const { Client } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 resolution to avoid IPv6 connectivity issues
dns.setDefaultResultOrder('ipv4first');

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  // Get connection details from environment
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in environment variables');
    console.log('\n💡 Please create a .env file with your Supabase DATABASE_URL');
    console.log('   Example: DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres\n');
    process.exit(1);
  }

  // Create a new client
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase cloud connection
    },
    // Add timeout settings and keep-alive
    keepAlive: true,
    connectionTimeoutMillis: 10000
  });

  try {
    // Attempt to connect
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Successfully connected to database!\n');

    // Test query: Get PostgreSQL version
    console.log('🔍 Testing query execution...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Query executed successfully!');
    console.log('📊 PostgreSQL Version:', versionResult.rows[0].version.split(',')[0]);

    // Get current timestamp
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Server Time:', timeResult.rows[0].current_time);

    // Test table listing
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in database:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    } else {
      console.log('   (No tables found in public schema)');
    }

    console.log('\n✨ Database connection test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: Check your database host URL');
    } else if (error.code === '28P01') {
      console.log('\n💡 Tip: Check your database password');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Tip: Check your network connection and firewall settings');
    }

    process.exit(1);
  } finally {
    // Always close the connection
    await client.end();
  }
}

// Run the test
testDatabaseConnection();
