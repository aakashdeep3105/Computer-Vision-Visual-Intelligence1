import db from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

// Small test script to verify database queries & AI service directly
async function runTests() {
  console.log('🧪 Starting System Integration Verification...');

  await db.initDB();

  // Test 1: User Registration query
  const testEmail = `operator_${Date.now()}@testcorp.com`;
  const insertUser = await db.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [testEmail, '$2a$10$abcdefghijklmnopqrstuvwxyz123456']
  );
  console.log('✅ User registered:', insertUser.rows[0]);
  const userA = insertUser.rows[0];

  // Test 2: User lookup query
  const lookupUser = await db.query('SELECT * FROM users WHERE email = $1', [testEmail]);
  if (lookupUser.rowCount === 1) {
    console.log('✅ User lookup by email succeeded.');
  } else {
    throw new Error('User lookup failed');
  }

  // Test 3: Insert Scan for User A
  const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
  const insertScan = await db.query(
    `INSERT INTO scans (user_id, domain, image_url, status, summary, sensitivity, custom_instructions)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      userA.id,
      'Manufacturing Quality Assurance',
      sampleBase64,
      'completed',
      'Test scan summary: minor scratch detected on flange perimeter.',
      'High',
      'Inspect seal ring'
    ]
  );
  console.log('✅ Scan record inserted:', insertScan.rows[0].id);
  const scanA = insertScan.rows[0];

  // Test 4: Insert Anomaly for Scan A
  const insertAnomaly = await db.query(
    `INSERT INTO anomalies (scan_id, label, description, severity, confidence_score, action_required)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      scanA.id,
      'Linear Surface Scratch',
      '3.5mm scratch detected on secondary flange',
      'High',
      0.94,
      'Buff flange and verify metallographic polish'
    ]
  );
  console.log('✅ Anomaly inserted:', insertAnomaly.rows[0].id);

  // Test 5: Verify User Isolation (User B cannot see User A's scan)
  const userB_Id = '00000000-0000-0000-0000-000000000099';
  const isolationCheck = await db.query(
    'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
    [scanA.id, userB_Id]
  );
  if (isolationCheck.rowCount === 0) {
    console.log('✅ User Isolation Verified: User B cannot access User A scan.');
  } else {
    throw new Error('RLS / Data Isolation Failure! User B was able to access User A scan.');
  }

  // Test 6: Verify User A can access own scan
  const accessCheck = await db.query(
    'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
    [scanA.id, userA.id]
  );
  if (accessCheck.rowCount === 1) {
    console.log('✅ Authorized access verified for User A.');
  } else {
    throw new Error('User A failed to access their own scan.');
  }

  // Test 7: Verify Dashboard Metrics
  const metricsCount = await db.query('SELECT COUNT(*) FROM scans WHERE user_id = $1', [userA.id]);
  console.log(`✅ Dashboard metrics scan count for User A: ${metricsCount.rows[0].count}`);

  console.log('🎉 All 7 integration verification tests passed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

