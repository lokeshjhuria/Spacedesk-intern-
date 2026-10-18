import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

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

  // Fallback to in-memory MongoDB
  console.log('[DB] Initializing in-memory MongoMemoryServer (zero external setup required)...');
  try {
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'space_shooter_odyssey'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to in-memory MongoDB instance: ${memoryUri}`);
  } catch (memErr) {
    console.error('[DB] Fatal error initializing MongoMemoryServer:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  console.log('[DB] Disconnected from MongoDB');
}
