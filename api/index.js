// Vercel Serverless Function entry point
// Connects Vercel's /api routes directly to the Express backend app
const app = require('../backend/server');

module.exports = app;
