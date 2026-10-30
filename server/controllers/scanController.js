import db from '../config/db.js';
import { analyzeImageWithGemini } from '../services/geminiService.js';
import { uploadImageToSupabase } from '../config/supabase.js';

/**
 * 1. POST /api/scans/analyze
 * Accepts image, domain, sensitivity, custom_instructions.
 * Runs multimodal Gemini AI vision analysis, persists scan and anomalies to DB,
 * and returns structured JSON response.
 */
export async function analyzeScan(req, res) {
  try {
    const userId = req.user.id;
    const { image, domain, sensitivity = 'Medium', custom_instructions = '' } = req.body;

    // Optional: Upload image to Supabase Storage if configured
    let persistedImageUrl = image;
    try {
      const storageUrl = await uploadImageToSupabase(image);
      if (storageUrl) {
        persistedImageUrl = storageUrl;
      }
    } catch (storageErr) {
      console.warn('[Supabase Storage Upload Note]', storageErr.message);
    }

    // Run multimodal AI analysis
    const aiResult = await analyzeImageWithGemini({
      image,
      domain,
      sensitivity,
      customInstructions: custom_instructions
    });

    // 1. Insert scan record with user_id logical isolation
    const scanInsert = await db.query(
      `INSERT INTO scans (user_id, domain, image_url, status, summary, sensitivity, custom_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        domain,
        persistedImageUrl,
        'completed',
        aiResult.summary,
        sensitivity,
        custom_instructions
      ]
    );

    const savedScan = scanInsert.rows[0];

    // 2. Insert detected anomalies linked to this scan
    const savedAnomalies = [];
    for (const anomaly of aiResult.anomalies) {
      const anomalyInsert = await db.query(
        `INSERT INTO anomalies (scan_id, label, description, severity, confidence_score, action_required)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          savedScan.id,
          anomaly.label,
          anomaly.description,
          anomaly.severity,
          anomaly.confidence_score,
          anomaly.action_required
        ]
      );
      savedAnomalies.push(anomalyInsert.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: 'Visual analysis completed successfully.',
      scan: {
        ...savedScan,
        anomalies: savedAnomalies
      }
    });
  } catch (error) {
    console.error('[Analyze Scan Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete visual analysis. Please verify image input and try again.'
    });
  }
}

/**
 * 2. GET /api/scans
 * Lists all scans for the authenticated user with pagination and anomaly counts.
 * Strict user isolation enforced with WHERE user_id = $1.
 */
export async function getScans(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Query scans with anomaly count and user isolation
    const result = await db.query(
      `SELECT s.*, 
              COUNT(a.id) as anomaly_count,
              COUNT(CASE WHEN a.severity = 'Critical' THEN 1 END) as critical_count
       FROM scans s 
       LEFT JOIN anomalies a ON s.id = a.scan_id 
       WHERE s.user_id = $1 
       GROUP BY s.id 
       ORDER BY s.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const totalCountResult = await db.query(
      `SELECT COUNT(*) FROM scans WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(totalCountResult.rows[0]?.count || 0);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('[Get Scans Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve scan history.'
    });
  }
}

/**
 * 3. GET /api/scans/:id
 * Fetches a single scan and all associated anomalies.
 * Enforces strict user isolation (WHERE id = $1 AND user_id = $2).
 */
export async function getScanById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Fetch scan ensuring it belongs strictly to this user
    const scanResult = await db.query(
      `SELECT * FROM scans WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (scanResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scan analysis not found or access unauthorized.'
      });
    }

    const scan = scanResult.rows[0];

    // Fetch anomalies for this scan
    const anomaliesResult = await db.query(
      `SELECT * FROM anomalies WHERE scan_id = $1 ORDER BY 
        CASE severity 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END, created_at ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      scan: {
        ...scan,
        anomalies: anomaliesResult.rows
      }
    });
  } catch (error) {
    console.error('[Get Scan By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch scan details.'
    });
  }
}

/**
 * 4. DELETE /api/scans/:id
 * Deletes a scan and cascades removal of associated anomalies.
 * Strictly checks user ownership before deleting.
 */
export async function deleteScan(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM scans WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scan and associated anomalies deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Scan Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete scan.'
    });
  }
}

/**
 * 5. GET /api/dashboard/metrics
 * Returns aggregate metrics for charts and summary cards:
 * - total scans
 * - critical anomalies count
 * - severity distribution
 * - domain distribution
 * - recent scans
 */
export async function getDashboardMetrics(req, res) {
  try {
    const userId = req.user.id;

    // Total Scans
    const totalScansResult = await db.query(
      `SELECT COUNT(*) FROM scans WHERE user_id = $1`,
      [userId]
    );
    const totalScans = parseInt(totalScansResult.rows[0]?.count || 0);

    // Critical Anomalies Count
    const criticalResult = await db.query(
      `SELECT COUNT(*) FROM anomalies a
       JOIN scans s ON a.scan_id = s.id
       WHERE s.user_id = $1 AND a.severity = 'Critical'`,
      [userId]
    );
    const criticalAnomalies = parseInt(criticalResult.rows[0]?.count || 0);

    // Domain Distribution
    const domainResult = await db.query(
      `SELECT domain, COUNT(*) as count
       FROM scans
       WHERE user_id = $1
       GROUP BY domain`,
      [userId]
    );

    // Severity Distribution
    const severityResult = await db.query(
      `SELECT a.severity, COUNT(*) as count
       FROM anomalies a
       JOIN scans s ON a.scan_id = s.id
       WHERE s.user_id = $1
       GROUP BY a.severity`,
      [userId]
    );

    // Recent Scans (last 5)
    const recentScansResult = await db.query(
      `SELECT s.*, 
              COUNT(a.id) as anomaly_count,
              COUNT(CASE WHEN a.severity = 'Critical' THEN 1 END) as critical_count
       FROM scans s 
       LEFT JOIN anomalies a ON s.id = a.scan_id 
       WHERE s.user_id = $1 
       GROUP BY s.id 
       ORDER BY s.created_at DESC 
       LIMIT 5 OFFSET 0`,
      [userId, 5, 0]
    );

    return res.status(200).json({
      success: true,
      metrics: {
        totalScans,
        criticalAnomalies,
        domainDistribution: domainResult.rows,
        severityDistribution: severityResult.rows,
        recentScans: recentScansResult.rows
      }
    });
  } catch (error) {
    console.error('[Dashboard Metrics Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard metrics.'
    });
  }
}

