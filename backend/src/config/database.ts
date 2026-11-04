import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { env } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

/**
 * Resolves the persistent database storage directory.
 * In production/deployed environments, uses a 'data' folder next to the backend root.
 * This ensures data survives server restarts without needing an external MongoDB.
 */
function getDbPath(): string {
  // Allow override via env var
  if (process.env.DB_PATH) {
    return path.resolve(process.env.DB_PATH);
  }
  // Default: <project-root>/data/db (persists across restarts)
  // Check relative to __dirname (which is in backend/src/config or backend/dist/config)
  const candidateDir1 = path.resolve(__dirname, '..', '..', '..', 'data', 'db');
  const candidateDir2 = path.resolve(__dirname, '..', '..', 'data', 'db');
  const candidateDir3 = path.resolve(process.cwd(), 'data', 'db');

  // If candidateDir1's parent (project root) has package.json, use candidateDir1
  if (fs.existsSync(path.resolve(__dirname, '..', '..', '..', 'package.json'))) {
    return candidateDir1;
  }
  if (fs.existsSync(path.resolve(__dirname, '..', '..', 'package.json'))) {
    return candidateDir2;
  }
  return candidateDir3;
}

export async function connectDB(): Promise<void> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  let uri = env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log('[DB] Successfully connected to external MongoDB');
      return;
    } catch (err) {
      console.warn('[DB] Failed to connect to specified MONGODB_URI. Falling back to embedded MongoMemoryServer.', err);
    }
  }

  const isTest = env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

  // In test mode, always use isolated ephemeral memory server
  if (isTest) {
    console.log('[DB] Running in test mode: initializing ephemeral in-memory MongoMemoryServer...');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'space_shooter_odyssey_test' }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to test in-memory MongoDB: ${memoryUri}`);
    return;
  }

  // In production / dev: use persistent embedded MongoDB on disk
  const dbPath = getDbPath();
  const isNewDb = !fs.existsSync(dbPath);

  // Ensure the data directory exists
  fs.mkdirSync(dbPath, { recursive: true });

  console.log(`[DB] Initializing embedded MongoDB with persistent storage at: ${dbPath}`);
  console.log(`[DB] Data will survive server restarts. ${isNewDb ? '(First run — will seed data)' : '(Existing data found)'}`);

  try {
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'space_shooter_odyssey',
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to persistent embedded MongoDB: ${memoryUri}`);
  } catch (memErr) {
    console.warn('[DB] Persistent storage error (directory might be locked by another process). Falling back to ephemeral in-memory:', memErr);
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'space_shooter_odyssey' }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to fallback in-memory MongoDB: ${memoryUri}`);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    // Stop the server but keep the data directory intact
    await mongoMemoryServer.stop({ doCleanup: false });
    mongoMemoryServer = null;
  }
  console.log('[DB] Disconnected from MongoDB (data persisted on disk)');
}
