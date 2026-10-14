const express = require('express');
const router = express.Router();
const db = require('../lib/db');

/**
 * GET /api/stats
 * Returns overall statistics for bookings, inquiries, and subscribers.
 */
router.get('/', async (req, res, next) => {
  try {
    const stats = await db.getSummaryStats();
    res.json({
      success: true,
      stats,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
