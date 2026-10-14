require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const bookingsRouter = require('./routes/bookings');
const contactsRouter = require('./routes/contacts');
const newsletterRouter = require('./routes/newsletter');
const servicesRouter = require('./routes/services');
const statsRouter = require('./routes/stats');
const db = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Define directories
const frontendDir = path.resolve(__dirname, '..', 'frontend');
const publicDir = path.resolve(__dirname, 'public');

// 1. CORS Middleware - permits calls from any origin (VS Code Live Server, file://, localhost, custom domains)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Simple informative logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timeStr = new Date().toLocaleTimeString();
    console.log(`[${timeStr}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 4. Static File Hosting
// Serve public assets (Admin Dashboard, etc.)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Serve frontend assets (index.html, services.html, pricing.html, contact.html, site.css, assets/)
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
}

// 5. Clean Page Routes & Aliases
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get(['/services', '/services.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'services.html'));
});

app.get(['/pricing', '/pricing.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'pricing.html'));
});

app.get(['/contact', '/contact.html'], (req, res) => {
  res.sendFile(path.join(frontendDir, 'contact.html'));
});

app.get(['/dashboard', '/dashboard.html'], (req, res) => {
  res.redirect('/');
});

// 6. API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chhaya-photo-studio-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    databaseLocation: db.dbDirectory,
  });
});

app.use('/api/bookings', bookingsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/services', servicesRouter);
app.use('/api/stats', statsRouter);

// 7. Fallback route for frontend root
app.get(['/', '/index', '/index.html'], (req, res) => {
  const indexPath = path.join(frontendDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.redirect('/admin');
});

// 8. 404 Handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// 9. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    status,
  });
});

// Start Server
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('   📸 CHHAYA PHOTO STUDIO - LIVE SERVER READY');
    console.log('======================================================');
    console.log(`🚀 Localhost:          http://localhost:${PORT}`);
    console.log(`🌐 Local Network:      http://192.168.10.187:${PORT}`);
    console.log(`✨ Admin Dashboard:   http://localhost:${PORT}/admin`);
    console.log(`📂 Database Folder:    ${db.dbDirectory}`);
    console.log('======================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[Server Error] Port ${PORT} is already in use.`);
      console.error(`Tip: You can change the port by setting PORT=3002 in .env\n`);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

module.exports = app;
