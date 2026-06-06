import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
          // Add connection event handlers
          mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });

          mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
          });

          mongoose.connection.on('reconnected', () => {
            console.info('MongoDB reconnected successfully');
          });

          return mongoose;
        });
        break;
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) {
          console.error(`Failed to connect to MongoDB after ${maxRetries} attempts:`, error);
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
