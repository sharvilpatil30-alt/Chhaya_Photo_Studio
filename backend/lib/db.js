const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// Resolve the database directory (uses /tmp on serverless like Vercel, otherwise local database folder)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const defaultDbDir = path.resolve(__dirname, '..', '..', 'database');
const dbDirectory = isServerless ? path.join('/tmp', 'chhaya_db') : defaultDbDir;

const files = {
  bookings: path.join(dbDirectory, 'bookings.json'),
  contacts: path.join(dbDirectory, 'contacts.json'),
  newsletter: path.join(dbDirectory, 'newsletter.json'),
};

/**
 * Ensures the target database JSON file exists.
 */
async function ensureFile(collection) {
  const filePath = files[collection];
  if (!filePath) {
    throw new Error(`Invalid collection name: "${collection}"`);
  }

  await fs.mkdir(dbDirectory, { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    // If running in /tmp, try to copy initial data from project repository
    let initialData = '[]\n';
    try {
      const sourcePath = path.join(defaultDbDir, `${collection}.json`);
      initialData = await fs.readFile(sourcePath, 'utf8');
    } catch {}
    await fs.writeFile(filePath, initialData, 'utf8');
  }

  return filePath;
}

/**
 * Reads all records from a collection.
 */
async function readAll(collection) {
  const filePath = await ensureFile(collection);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error reading ${collection}:`, error.message);
    return [];
  }
}

/**
 * Atomically writes data to collection JSON file.
 */
async function writeAll(collection, data) {
  const filePath = await ensureFile(collection);
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const jsonContent = JSON.stringify(data, null, 2) + '\n';

  await fs.writeFile(tempPath, jsonContent, 'utf8');
  await fs.rename(tempPath, filePath);
}

/**
 * Finds a record by ID.
 */
async function findById(collection, id) {
  const items = await readAll(collection);
  return items.find((item) => item.id === id) || null;
}

/**
 * Inserts a new record into a collection.
 */
async function insert(collection, itemData) {
  const items = await readAll(collection);
  const newItem = {
    id: crypto.randomUUID(),
    ...itemData,
    createdAt: itemData.createdAt || new Date().toISOString(),
  };

  items.unshift(newItem); // Newest first
  await writeAll(collection, items);
  return newItem;
}

/**
 * Updates an existing record by ID.
 */
async function updateById(collection, id, updates) {
  const items = await readAll(collection);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updatedItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updatedItem;
  await writeAll(collection, items);
  return updatedItem;
}

/**
 * Deletes a record by ID.
 */
async function deleteById(collection, id) {
  const items = await readAll(collection);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  const [removed] = items.splice(index, 1);
  await writeAll(collection, items);
  return removed;
}

/**
 * Returns summary counts for all collections.
 */
async function getSummaryStats() {
  const [bookings, contacts, newsletter] = await Promise.all([
    readAll('bookings'),
    readAll('contacts'),
    readAll('newsletter'),
  ]);

  const pendingBookings = bookings.filter(
    (b) => !b.status || b.status.toLowerCase() === 'pending'
  ).length;
  const confirmedBookings = bookings.filter(
    (b) => b.status && b.status.toLowerCase() === 'confirmed'
  ).length;

  return {
    bookings: {
      total: bookings.length,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: bookings.filter((b) => b.status && b.status.toLowerCase() === 'completed').length,
    },
    contacts: {
      total: contacts.length,
      unread: contacts.filter((c) => !c.status || c.status === 'unread').length,
    },
    newsletter: {
      total: newsletter.length,
    },
  };
}

module.exports = {
  dbDirectory,
  readAll,
  writeAll,
  findById,
  insert,
  updateById,
  deleteById,
  getSummaryStats,
};
