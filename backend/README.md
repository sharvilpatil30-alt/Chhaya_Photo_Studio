# Chhaya Photo Studio — Backend Engine

A fast, lightweight Node.js + Express backend powering the **Chhaya Photo Studio** website. Built to handle client session bookings, contact inquiries, newsletter subscriptions, and live studio management with an integrated dark/gold luxury Admin Dashboard.

---

## ⚡ Quick Start

### 1. Start the Server
```bash
# In D:\SY\WD\PROJECT\Chhaya_Photo_Studio\backend
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

The server will boot up and print:
- **API Base URL**: `http://localhost:3001`
- **Admin Dashboard**: `http://localhost:3001/admin`
- **Website Frontend**: `http://localhost:3001/`
- **Database Storage**: `../database/`

### 2. Run Automated API Tests
```bash
npm run test:api
```
Validates all endpoints (health check, booking validation, status patching, contact inquiries, newsletter deduplication).

---

## 🧭 System Endpoints

### 📅 Bookings API
- `GET /api/bookings` — Fetch all bookings (supports `?status=pending|confirmed|completed|cancelled` & `?search=keyword`)
- `GET /api/bookings/:id` — Fetch single booking details
- `POST /api/bookings` — Create a new session booking:
  ```json
  {
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "+91 98765 43210",
    "date": "2026-11-15",
    "serviceType": "Wedding Coverage",
    "message": "Looking for pre-wedding + wedding ceremony coverage."
  }
  ```
- `PATCH /api/bookings/:id` — Update booking status or notes (`{ "status": "confirmed" }`)
- `DELETE /api/bookings/:id` — Remove a booking

### 💬 Contact Inquiries API
- `GET /api/contacts` — Fetch all submitted inquiries (supports `?status=unread|read|replied` & `?search=keyword`)
- `GET /api/contacts/:id` — Fetch single inquiry
- `POST /api/contacts` — Submit inquiry:
  ```json
  {
    "name": "Rahul Patil",
    "email": "rahul@example.com",
    "phone": "+91 91234 56789",
    "subject": "Portrait Session",
    "message": "Do you offer in-studio portrait sessions on weekends?"
  }
  ```
- `PATCH /api/contacts/:id` — Update inquiry status (`{ "status": "read" }`)
- `DELETE /api/contacts/:id` — Delete inquiry

### 📬 Newsletter API
- `GET /api/newsletter` — List all subscribers
- `POST /api/newsletter` — Subscribe email:
  ```json
  {
    "email": "subscriber@domain.com"
  }
  ```
- `DELETE /api/newsletter/:id` — Unsubscribe email

### 🛠️ Utilities & Services
- `GET /api/health` — System status, uptime timestamp, and database file location
- `GET /api/services` — Structured catalog of photography packages and deliverables
- `GET /api/stats` — Summary metrics (total bookings, pending count, total inquiries, total subscribers)

---

## 🎨 Admin Dashboard (`/admin`)
Visit `http://localhost:3001/admin` in any web browser to access:
1. **Live KPIs**: Real-time counter of total bookings, pending sessions, customer inquiries, and newsletter subscribers.
2. **Bookings Manager**: Filter bookings by status, search by client details, update status dynamically (Pending → Confirmed → Completed), and delete records.
3. **Inquiry Inbox**: Read customer queries, reply directly via Email/WhatsApp links, and organize messages.
4. **Newsletter Manager**: View subscriber emails and use the "Copy All Emails" button for marketing broadcasts.
5. **Interactive API Tester**: One-click simulation buttons to generate sample bookings or ping health checks directly from the browser.

---

## 📂 Architecture & Data Persistence
- **Atomic JSON Storage**: All records are securely stored in `../database/` (`bookings.json`, `contacts.json`, `newsletter.json`) with atomic temporary-file writes to ensure zero data corruption.
- **Cross-Origin (CORS)**: Preconfigured to allow requests from any frontend port, Live Server (`5500`), or `file:///` protocols.
- **Unified Hosting**: The Express server automatically serves both the backend APIs and static frontend HTML files (`services.html`, `pricing.html`, `contact.html`, `index.html`).
