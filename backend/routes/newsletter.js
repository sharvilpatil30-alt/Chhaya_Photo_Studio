const express = require('express');
const router = express.Router();
const db = require('../lib/db');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * GET /api/newsletter
 * Returns all newsletter subscribers.
 */
router.get('/', async (req, res, next) => {
  try {
    const newsletter = await db.readAll('newsletter');
    res.json({
      success: true,
      count: newsletter.length,
      newsletter,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/newsletter
 * Subscribes a new email address.
 */
router.post('/', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const currentSubscribers = await db.readAll('newsletter');
    const existing = currentSubscribers.find((sub) => sub.email === email);

    if (existing) {
      return res.status(200).json({
        message: 'Email is already subscribed.',
        subscription: existing,
      });
    }

    const newSub = await db.insert('newsletter', {
      email,
      source: req.body?.source || 'website_footer',
    });

    res.status(201).json({
      message: 'Subscribed successfully.',
      subscription: newSub,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/newsletter/:id
 * Removes a subscriber by ID.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await db.deleteById('newsletter', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Subscriber not found.' });
    }
    res.json({
      message: 'Unsubscribed successfully.',
      subscriber: deleted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
