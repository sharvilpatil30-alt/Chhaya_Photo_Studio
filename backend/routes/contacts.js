const express = require('express');
const router = express.Router();
const db = require('../lib/db');

/**
 * Validates contact inquiry payload.
 */
function validateContactPayload(body) {
  const errors = [];
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const message = String(body?.message || '').trim();

  if (!name) errors.push('Name is required');
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!message) errors.push('Message is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/contacts
 * Returns all contact inquiries.
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let contacts = await db.readAll('contacts');

    if (status && status !== 'all') {
      contacts = contacts.filter(
        (c) => (c.status || 'unread').toLowerCase() === status.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.subject && c.subject.toLowerCase().includes(q)) ||
          (c.message && c.message.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/contacts/:id
 * Returns single contact inquiry.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await db.findById('contacts', req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact inquiry not found.' });
    }
    res.json({ success: true, contact });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/contacts
 * Submits a new contact inquiry.
 */
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }

    const validation = validateContactPayload(payload);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.errors.join(', '),
        details: validation.errors,
      });
    }

    const contactData = {
      name: String(payload.name).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone || '').trim(),
      subject: String(payload.subject || payload.service || 'General Inquiry').trim(),
      message: String(payload.message).trim(),
      status: 'unread', // unread | read | replied
      createdAt: new Date().toISOString(),
    };

    const createdContact = await db.insert('contacts', contactData);

    res.status(201).json({
      message: 'Inquiry received successfully. We will get back to you soon.',
      contact: createdContact,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/contacts/:id
 * Updates contact inquiry status (read/replied).
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updates = {};

    if (status) {
      const allowed = ['unread', 'read', 'replied'];
      if (!allowed.includes(status.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${allowed.join(', ')}`,
        });
      }
      updates.status = status.toLowerCase();
    }

    if (notes !== undefined) updates.notes = String(notes).trim();

    const updated = await db.updateById('contacts', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Contact inquiry not found.' });
    }

    res.json({
      message: 'Contact inquiry updated.',
      contact: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/contacts/:id
 * Deletes a contact inquiry.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await db.deleteById('contacts', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact inquiry not found.' });
    }

    res.json({
      message: 'Contact inquiry deleted.',
      deletedContact: deleted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
