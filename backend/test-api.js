const http = require('http');

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 Running API Integration Tests on ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 and status ok');

    // 2. Services list
    const services = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/services',
      method: 'GET',
    });
    assert(services.status === 200 && Array.isArray(services.data.services), 'GET /api/services returns services list');

    // 3. Stats
    const stats = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/stats',
      method: 'GET',
    });
    assert(stats.status === 200 && stats.data.stats, 'GET /api/stats returns studio statistics');

    // 4. Bookings Validation (missing fields)
    const badBooking = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Incomplete Booking' }
    );
    assert(badBooking.status === 400, 'POST /api/bookings rejects payload with missing required fields');

    // 5. Create Booking
    const testBookingPayload = {
      name: 'Integration Test Client',
      email: 'test.client@example.com',
      phone: '+91 99999 88888',
      date: '2026-11-20',
      serviceType: 'Wedding Coverage',
      message: 'Automated test booking message.',
    };
    const createBooking = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      testBookingPayload
    );
    assert(createBooking.status === 201 && createBooking.data.booking?.id, 'POST /api/bookings creates valid booking');
    const createdBookingId = createBooking.data.booking?.id;

    // 6. Update Booking Status (PATCH)
    if (createdBookingId) {
      const updateBooking = await request(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/bookings/${createdBookingId}`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        { status: 'confirmed' }
      );
      assert(updateBooking.status === 200 && updateBooking.data.booking?.status === 'confirmed', 'PATCH /api/bookings/:id updates status');

      // Delete test booking
      const deleteBooking = await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/bookings/${createdBookingId}`,
        method: 'DELETE',
      });
      assert(deleteBooking.status === 200, 'DELETE /api/bookings/:id deletes the booking');
    }

    // 7. Contacts Validation & Creation
    const testContactPayload = {
      name: 'Pooja Test',
      email: 'pooja.test@example.com',
      phone: '+91 91234 56789',
      subject: 'Portrait Session',
      message: 'Hello, this is an automated contact test message.',
    };
    const createContact = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/contacts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      testContactPayload
    );
    assert(createContact.status === 201 && createContact.data.contact?.id, 'POST /api/contacts creates inquiry');
    const createdContactId = createContact.data.contact?.id;

    if (createdContactId) {
      const deleteContact = await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/contacts/${createdContactId}`,
        method: 'DELETE',
      });
      assert(deleteContact.status === 200, 'DELETE /api/contacts/:id deletes inquiry');
    }

    // 8. Newsletter Subscription & Deduplication
    const uniqueNewsEmail = `tester.${Date.now()}@news.com`;
    const news1 = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/newsletter',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: uniqueNewsEmail }
    );
    assert(news1.status === 201, 'POST /api/newsletter subscribes new email');

    const news2 = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/newsletter',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: uniqueNewsEmail }
    );
    assert(news2.status === 200 && news2.data.message.includes('already subscribed'), 'POST /api/newsletter detects duplicate subscription');

    if (news1.data.subscription?.id) {
      await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/newsletter/${news1.data.subscription.id}`,
        method: 'DELETE',
      });
    }

    console.log(`\n======================================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\nTest runner failed to connect to server:', err.message);
    console.error('Make sure the server is running on port ' + PORT);
    process.exit(1);
  }
}

runTests();
