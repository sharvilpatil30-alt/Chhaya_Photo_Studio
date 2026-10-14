const express = require('express');
const router = express.Router();

const servicesCatalog = [
  {
    id: 'portrait-session',
    title: 'Portrait Session',
    category: 'Individual & Editorial',
    description: 'Bespoke portrait sessions crafted in-studio or on location with artistic lighting, styling direction, and high-end retouching.',
    startingPrice: '₹4,999',
    duration: '2 - 3 Hours',
    deliverables: ['15 Retouched High-Res Images', 'Online Private Gallery', 'Studio Lighting Setup', 'Print Release'],
  },
  {
    id: 'wedding-coverage',
    title: 'Wedding Coverage',
    category: 'Ceremony & Celebrations',
    description: 'Comprehensive wedding documentation capturing authentic emotions, timeless rituals, and cinematic highlights with a multi-shooter crew.',
    startingPrice: '₹45,000',
    duration: 'Full Day / Multi-Day',
    deliverables: ['Candid & Traditional Coverage', 'Cinematic Highlight Film (4-5 mins)', 'Full Length Documentary Video', 'Handcrafted Premium Photo Album'],
  },
  {
    id: 'commercial-shoot',
    title: 'Commercial Shoot',
    category: 'Brand & E-commerce',
    description: 'Visual storytelling tailored for brands, fashion lookbooks, culinary concepts, and architecture portfolios engineered for marketing.',
    startingPrice: '₹14,999',
    duration: 'Half Day / Full Day',
    deliverables: ['Color Graded High-Res Assets', 'Full Commercial Usage Rights', 'Fast Turnaround (48-72 hrs)', 'Multi-Angle Catalog Sets'],
  },
  {
    id: 'pre-wedding',
    title: 'Pre-Wedding Experience',
    category: 'Couple & Lifestyle',
    description: 'Dreamy, romantic pre-wedding shoots at picturesque destinations with drone cinematography and creative storyline framing.',
    startingPrice: '₹22,000',
    duration: '1 Full Day',
    deliverables: ['30 Master Retouched Photos', 'Teaser Reel (60s 4K)', 'Drone Aerial Shots', 'Styling Guidance'],
  },
];

/**
 * GET /api/services
 * Returns the studio services catalog.
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: servicesCatalog.length,
    services: servicesCatalog,
  });
});

/**
 * GET /api/services/:id
 * Returns details for a single service.
 */
router.get('/:id', (req, res) => {
  const service = servicesCatalog.find((s) => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  res.json({ success: true, service });
});

module.exports = router;
