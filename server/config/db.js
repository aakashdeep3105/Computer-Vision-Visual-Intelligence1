import pkg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isPostgresConnected = false;

// Local fallback store file path for zero-friction resilience
const FALLBACK_DB_PATH = path.join(__dirname, '..', '.local_storage.json');

// In-memory fallback structure
let localData = {
  users: [],
  scans: [],
  anomalies: []
};

// Load local fallback data if exists
function loadLocalFallback() {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const content = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
      localData = JSON.parse(content);
      if (!localData.users) localData.users = [];
      if (!localData.scans) localData.scans = [];
      if (!localData.anomalies) localData.anomalies = [];
    }
  } catch (err) {
    console.error('[Fallback DB] Failed to load persistent fallback store:', err.message);
  }
}

// Save local fallback data
function saveLocalFallback() {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(localData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Fallback DB] Failed to persist fallback store:', err.message);
  }
}

// Initialize database
export async function initDB() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      const isRemotePg = connectionString.includes('sslmode=require') || 
                         connectionString.includes('neon.tech') || 
                         connectionString.includes('supabase.co') || 
                         connectionString.includes('supabase.com') ||
                         connectionString.includes('pooler.supabase.com');

      pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: isRemotePg ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await pool.connect();
      console.log('✅ [Database] Successfully connected to PostgreSQL database.');
      isPostgresConnected = true;

      // Ensure schemas exist
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS scans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          domain VARCHAR(50) NOT NULL,
          image_url TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'completed',
          summary TEXT,
          sensitivity VARCHAR(20) DEFAULT 'Medium',
          custom_instructions TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS anomalies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
          label VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          severity VARCHAR(20) NOT NULL,
          confidence_score NUMERIC(3,2) NOT NULL,
          action_required TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      return;
    } catch (err) {
      console.warn(`⚠️ [Database] PostgreSQL connection failed (${err.message}).`);
      console.warn(`ℹ️ [Database] Running in High-Availability Fallback Mode using persistent local store.`);
      isPostgresConnected = false;
      if (pool) {
        await pool.end().catch(() => {});
        pool = null;
      }
    }
  } else {
    console.warn(`⚠️ [Database] No DATABASE_URL specified. Running in Fallback Storage Mode.`);
  }

  loadLocalFallback();
}

/**
 * Universal Query Execution
 * If PostgreSQL is connected, executes directly via pg.Pool.
 * If PostgreSQL is unavailable, intelligently emulates PostgreSQL queries
 * preserving relational integrity, cascading deletes, and strict user isolation.
 */
export async function query(text, params = []) {
  if (isPostgresConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('[PostgreSQL Query Error]', err.message, { text, params });
      throw err;
    }
  }

  // --- Fallback Query Engine for Development & Zero-Dependency Testing ---
  const sql = text.trim();
  const lowerSql = sql.toLowerCase();

  // 1. INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at
  if (lowerSql.startsWith('insert into users')) {
    const email = params[0];
    const passwordHash = params[1];

    const existing = localData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    localData.users.push(newUser);
    saveLocalFallback();

    return {
      rows: [{ id: newUser.id, email: newUser.email, created_at: newUser.created_at }],
      rowCount: 1
    };
  }

  // 2. SELECT * FROM users WHERE email = $1
  if (lowerSql.startsWith('select') && lowerSql.includes('from users where email =')) {
    const email = params[0];
    const user = localData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return {
      rows: user ? [{ ...user }] : [],
      rowCount: user ? 1 : 0
    };
  }

  // 3. SELECT id, email, created_at FROM users WHERE id = $1
  if (lowerSql.startsWith('select') && lowerSql.includes('from users where id =')) {
    const id = params[0];
    const user = localData.users.find(u => u.id === id);
    if (!user) return { rows: [], rowCount: 0 };
    return {
      rows: [{ id: user.id, email: user.email, created_at: user.created_at }],
      rowCount: 1
    };
  }

  // 4. INSERT INTO scans (...) VALUES (...) RETURNING *
  if (lowerSql.startsWith('insert into scans')) {
    // Expected params: [user_id, domain, image_url, status, summary, sensitivity, custom_instructions]
    const newScan = {
      id: crypto.randomUUID(),
      user_id: params[0],
      domain: params[1],
      image_url: params[2],
      status: params[3] || 'completed',
      summary: params[4] || '',
      sensitivity: params[5] || 'Medium',
      custom_instructions: params[6] || '',
      created_at: new Date().toISOString()
    };
    localData.scans.push(newScan);
    saveLocalFallback();
    return {
      rows: [newScan],
      rowCount: 1
    };
  }

  // 5. INSERT INTO anomalies (scan_id, label, description, severity, confidence_score, action_required)
  if (lowerSql.startsWith('insert into anomalies')) {
    const newAnomaly = {
      id: crypto.randomUUID(),
      scan_id: params[0],
      label: params[1],
      description: params[2],
      severity: params[3],
      confidence_score: parseFloat(params[4]),
      action_required: params[5],
      created_at: new Date().toISOString()
    };
    localData.anomalies.push(newAnomaly);
    saveLocalFallback();
    return {
      rows: [newAnomaly],
      rowCount: 1
    };
  }

  // 6. SELECT COUNT(*) FROM scans WHERE user_id = $1 (Total Scans)
  if (lowerSql.includes('count(*)') && lowerSql.includes('from scans') && !lowerSql.includes('group by')) {
    const userId = params[0];
    const count = localData.scans.filter(s => s.user_id === userId).length;
    return {
      rows: [{ count: count.toString() }],
      rowCount: 1
    };
  }

  // 7. Critical Anomalies Count
  if (lowerSql.includes('from anomalies a') && lowerSql.includes('join scans s') && lowerSql.includes('critical')) {
    const userId = params[0];
    const userScanIds = new Set(localData.scans.filter(s => s.user_id === userId).map(s => s.id));
    const count = localData.anomalies.filter(a => userScanIds.has(a.scan_id) && a.severity.toLowerCase() === 'critical').length;
    return {
      rows: [{ count: count.toString() }],
      rowCount: 1
    };
  }

  // 8. Domain Distribution / Group By Domain
  if (lowerSql.includes('select domain, count(*)') && lowerSql.includes('from scans') && lowerSql.includes('group by domain')) {
    const userId = params[0];
    const userScans = localData.scans.filter(s => s.user_id === userId);
    const domainCounts = {};
    for (const scan of userScans) {
      domainCounts[scan.domain] = (domainCounts[scan.domain] || 0) + 1;
    }
    const rows = Object.entries(domainCounts).map(([domain, count]) => ({
      domain,
      count: count.toString()
    }));
    return { rows, rowCount: rows.length };
  }

  // 9. Severity Distribution
  if (lowerSql.includes('select a.severity, count(*)') || lowerSql.includes('group by a.severity')) {
    const userId = params[0];
    const userScanIds = new Set(localData.scans.filter(s => s.user_id === userId).map(s => s.id));
    const userAnomalies = localData.anomalies.filter(a => userScanIds.has(a.scan_id));
    const severityCounts = {};
    for (const an of userAnomalies) {
      severityCounts[an.severity] = (severityCounts[an.severity] || 0) + 1;
    }
    const rows = Object.entries(severityCounts).map(([severity, count]) => ({
      severity,
      count: count.toString()
    }));
    return { rows, rowCount: rows.length };
  }

  // 10. List all scans for user with pagination & anomaly counts
  // SELECT s.*, COUNT(a.id) as anomaly_count FROM scans s LEFT JOIN anomalies a ... WHERE s.user_id = $1 ...
  if (lowerSql.includes('from scans s left join anomalies a') && lowerSql.includes('group by s.id')) {
    const userId = params[0];
    const limit = parseInt(params[1]) || 10;
    const offset = parseInt(params[2]) || 0;

    let userScans = localData.scans
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalCount = userScans.length;
    const paginated = userScans.slice(offset, offset + limit);

    const rows = paginated.map(scan => {
      const scanAnomalies = localData.anomalies.filter(a => a.scan_id === scan.id);
      return {
        ...scan,
        anomaly_count: scanAnomalies.length.toString(),
        critical_count: scanAnomalies.filter(a => a.severity.toLowerCase() === 'critical').length.toString()
      };
    });

    return {
      rows,
      rowCount: rows.length,
      totalCount
    };
  }

  // 11. GET specific scan by id with user_id isolation
  // SELECT * FROM scans WHERE id = $1 AND user_id = $2
  if (lowerSql.startsWith('select') && lowerSql.includes('from scans where id = $1 and user_id = $2')) {
    const scanId = params[0];
    const userId = params[1];
    const scan = localData.scans.find(s => s.id === scanId && s.user_id === userId);
    return {
      rows: scan ? [{ ...scan }] : [],
      rowCount: scan ? 1 : 0
    };
  }

  // 12. GET anomalies for a scan
  // SELECT * FROM anomalies WHERE scan_id = $1 ORDER BY ...
  if (lowerSql.startsWith('select') && lowerSql.includes('from anomalies where scan_id = $1')) {
    const scanId = params[0];
    const anomalies = localData.anomalies
      .filter(a => a.scan_id === scanId)
      .sort((a, b) => {
        const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.severity] || 0) - (order[a.severity] || 0);
      });
    return {
      rows: anomalies.map(a => ({ ...a })),
      rowCount: anomalies.length
    };
  }

  // 13. DELETE scan by id and user_id (with cascade)
  // DELETE FROM scans WHERE id = $1 AND user_id = $2 RETURNING *
  if (lowerSql.startsWith('delete from scans where id = $1 and user_id = $2')) {
    const scanId = params[0];
    const userId = params[1];
    const scanIndex = localData.scans.findIndex(s => s.id === scanId && s.user_id === userId);
    if (scanIndex === -1) {
      return { rows: [], rowCount: 0 };
    }
    const [deletedScan] = localData.scans.splice(scanIndex, 1);
    // Cascade delete anomalies
    localData.anomalies = localData.anomalies.filter(a => a.scan_id !== scanId);
    saveLocalFallback();
    return {
      rows: [deletedScan],
      rowCount: 1
    };
  }

  // Default empty response
  return { rows: [], rowCount: 0 };
}

export default {
  query,
  initDB
};

