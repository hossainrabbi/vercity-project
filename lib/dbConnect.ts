import mongoose from 'mongoose';
import '@/models';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongoServer?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Create a non-nullable reference to satisfy TypeScript type checking
const mongooseCache: MongooseCache = cached;

async function dbConnect(): Promise<typeof mongoose> {
  // Enable Mongoose query debugging to log executed queries to console
  mongoose.set('debug', true);

  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongooseCache.promise = (async () => {
      let conn: typeof mongoose | null = null;
      // Evaluate MONGODB_URI dynamically inside the connection function
      const currentUri = process.env.MONGODB_URI;

      // 1. Try connecting to the configured MONGODB_URI
      if (currentUri) {
        try {
          console.log(`Connecting to MongoDB at: ${currentUri}`);
          conn = await mongoose.connect(currentUri, {
            ...opts,
            serverSelectionTimeoutMS: 5000,
          });
          console.log('MongoDB connected successfully.');
        } catch (error: any) {
          console.error(`Failed to connect to MONGODB_URI: ${currentUri}. Error: ${error.message}`);
        }
      }

      // 2. Fallback to MongoMemoryServer in development/test only if MONGODB_URI is not provided
      if (!conn && !currentUri && process.env.NODE_ENV !== 'production') {
        try {
          console.log('Starting in-memory MongoDB server...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!mongooseCache.mongoServer) {
            mongooseCache.mongoServer = await MongoMemoryServer.create({
              instance: {
                dbName: 'school-management',
              }
            });
          }
          const uri = mongooseCache.mongoServer.getUri();
          console.log(`In-memory MongoDB started at: ${uri}`);
          conn = await mongoose.connect(uri, opts);
          console.log('Connected to in-memory MongoDB.');
        } catch (memError: any) {
          console.error('Failed to start in-memory MongoDB:', memError.message);
          throw memError;
        }
      }

      if (!conn) {
        if (currentUri) {
          throw new Error(`Failed to connect to configured MONGODB_URI: ${currentUri}`);
        } else {
          throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }
      }

      // Print temporary debug logging:
      // connected database name, available collection names, and document counts for each collection.
      try {
        const db = conn.connection.db;
        if (db) {
          console.log(`[DEBUG] Connected Database Name: ${conn.connection.name}`);
          const collections = await db.listCollections().toArray();
          console.log('[DEBUG] --- Available Collections and Document Counts ---');
          for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`[DEBUG] Collection: "${col.name}" - Documents: ${count}`);
          }
          console.log('[DEBUG] ------------------------------------------------');
        }
      } catch (err: any) {
        console.error('[DEBUG] Failed to print DB diagnostics logs:', err.message);
      }

      return conn;
    })();
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
  } catch (e) {
    mongooseCache.promise = null;
    throw e;
  }

  return mongooseCache.conn;
}

export default dbConnect;
