const express = require('express');
const router = express.Router();
const db = require('../lib/db');

/**
 * Validates booking submission payload.
 */
function validateBookingPayload(body) {
  const errors = [];
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const date = String(body?.date || '').trim();
  const serviceType = String(body?.serviceType || '').trim();

  if (!name) errors.push('Name is required');
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!date) errors.push('Booking date is required');
  if (!serviceType) errors.push('Service type is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/bookings
 * Returns all bookings, optionally filtered by status or search keyword.
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let bookings = await db.readAll('bookings');

    if (status && status !== 'all') {
      bookings = bookings.filter(
        (b) => (b.status || 'pending').toLowerCase() === status.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.phone && b.phone.includes(q)) ||
          (b.serviceType && b.serviceType.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bookings/:id
 * Returns a single booking by ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await db.findById('bookings', req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookings
 * Creates a new booking session request.
 */
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }

    const validation = validateBookingPayload(payload);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.errors.join(', '),
        details: validation.errors,
      });
    }

    const bookingData = {
      name: String(payload.name).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone || '').trim(),
      date: String(payload.date).trim(),
      serviceType: String(payload.serviceType).trim(),
      message: String(payload.message || '').trim(),
      status: 'pending', // pending | confirmed | completed | cancelled
      createdAt: new Date().toISOString(),
    };

    const createdBooking = await db.insert('bookings', bookingData);

    // Response structure strictly compatible with frontend
    res.status(201).json({
      message: 'Booking submitted successfully. We will contact you soon.',
      booking: createdBooking,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/bookings/:id
 * Updates booking status or details.
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, message, notes } = req.body;
    const updates = {};

    if (status) {
      const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        });
      }
      updates.status = status.toLowerCase();
    }

    if (message !== undefined) updates.message = String(message).trim();
    if (notes !== undefined) updates.notes = String(notes).trim();

    const updated = await db.updateById('bookings', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({
      message: 'Booking updated successfully.',
      booking: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/bookings/:id
 * Deletes a booking by ID.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await db.deleteById('bookings', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({
      message: 'Booking deleted successfully.',
      deletedBooking: deleted,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
