import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Ensure DNS resolution handles SRV and prioritizes IPv4 across all networks & Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Fallback to system default DNS
}

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore if not supported
}


// Resolve directory and ensure backend/.env is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Safely format MongoDB connection URI with URL-encoded credentials if needed
 */
const formatMongoUriSafely = (rawUri) => {
  if (!rawUri) return rawUri;
  const trimmed = rawUri.trim();

  const prefixMatch = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!prefixMatch) return trimmed;

  const prefix = prefixMatch[1];
  const rest = prefixMatch[2];

  const atIndex = rest.lastIndexOf('@');
  if (atIndex === -1) return trimmed;

  const userInfo = rest.substring(0, atIndex);
  const hostAndRest = rest.substring(atIndex + 1);

  const colonIndex = userInfo.indexOf(':');
  if (colonIndex === -1) return trimmed;

  const username = userInfo.substring(0, colonIndex);
  const password = userInfo.substring(colonIndex + 1);

  let decodedUser = username;
  let decodedPass = password;
  try { decodedUser = decodeURIComponent(username); } catch {}
  try { decodedPass = decodeURIComponent(password); } catch {}

  const encodedUser = encodeURIComponent(decodedUser);
  const encodedPass = encodeURIComponent(decodedPass);

  return `${prefix}${encodedUser}:${encodedPass}@${hostAndRest}`;
};

/**
 * Categorize MongoDB connection errors safely without leaking credentials.
 */
const categorizeError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  const codeName = err?.codeName || '';

  if (codeName === 'AuthenticationFailed' || msg.includes('bad auth') || msg.includes('authentication failed') || msg.includes('auth error')) {
    return {
      category: 'Authentication failure',
      action: 'Verify that the database username exists in MongoDB Atlas > Security > Database Access and that the password matches the MONGODB_URI in backend/.env exactly.'
    };
  }

  if (msg.includes('querysrv') || msg.includes('econnrefused') || err?.code === 'ECONNREFUSED' || msg.includes('enotfound')) {
    return {
      category: 'DNS resolution failure',
      action: 'Atlas SRV hostname lookup failed. Ensure internet connectivity and verify DNS configuration.'
    };
  }

  if (err?.name === 'MongooseServerSelectionError' || msg.includes('serverselection') || msg.includes("ip that isn't whitelisted") || msg.includes('timed out') || msg.includes('etimedout')) {
    return {
      category: 'Network / IP Access failure',
      action: 'Ensure your current IP is added to the IP Access List in MongoDB Atlas > Security > Network Access (or allow 0.0.0.0/0 for development).'
    };
  }

  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate')) {
    return {
      category: 'TLS / SSL handshake failure',
      action: 'Check TLS/SSL network configuration or firewall restrictions on port 27017.'
    };
  }

  return {
    category: 'MongoDB Connection Error',
    action: 'Verify cluster health and status in MongoDB Atlas dashboard.'
  };
};

// Global listener flag to avoid duplicate listeners
let listenersAttached = false;

const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    // Logged on initial connect
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB Error]', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Warning] Disconnected from MongoDB Atlas. Mongoose will automatically reconnect when available...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB Info] Reconnected to MongoDB Atlas successfully.');
  });
};

export const connectDB = async () => {
  // If already connected, return existing singleton connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Read MONGODB_URI dynamically at connection time
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error('\n================ DATABASE CONNECTION ERROR ================');
    console.error('Error: MONGODB_URI is not configured in backend/.env');
    console.error('Please configure your MongoDB Atlas connection string in backend/.env');
    console.error('===========================================================\n');
    process.exit(1);
  }

  const trimmed = uri.trim();

  // Validate protocol
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    console.error('\n================ DATABASE CONNECTION ERROR ================');
    console.error('Error: MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
    console.error('Please verify your connection string format in backend/.env');
    console.error('===========================================================\n');
    process.exit(1);
  }

  // Reject localhost/127.0.0.1 connection attempts
  if (
    trimmed.includes('localhost') || 
    trimmed.includes('127.0.0.1') || 
    trimmed.startsWith('mongodb://localhost') || 
    trimmed.startsWith('mongodb://127.0.0.1')
  ) {
    console.error('\n================ DATABASE CONNECTION ERROR ================');
    console.error('Error: Localhost MongoDB connection is not permitted.');
    console.error('Please provide a valid MongoDB Atlas connection URI (mongodb+srv://...) in backend/.env');
    console.error('===========================================================\n');
    process.exit(1);
  }

  // Ensure safe URL encoding and query parameters
  let connectionUri = formatMongoUriSafely(trimmed);
  if (!connectionUri.includes('authSource=')) {
    const separator = connectionUri.includes('?') ? '&' : '?';
    connectionUri = `${connectionUri}${separator}retryWrites=true&w=majority&authSource=admin`;
  }

  attachConnectionListeners();

  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Atlas connected successfully to database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    const { category, action } = categorizeError(error);

    // Sanitize any potential sensitive information
    const rawError = error?.message || 'Connection failed';
    const sanitizedError = rawError.replace(/:([^:@]+)@/, ':***@');

    console.error('\n================ DATABASE CONNECTION DIAGNOSTICS ================');
    console.error('[Database Error] Could not connect to MongoDB Atlas.');
    console.error(`- MongoDB URI configured: YES`);
    console.error(`- Failure Category: ${category}`);
    console.error(`- Diagnostic Detail: ${sanitizedError}`);
    console.error(`\nResolution Guide:`);
    console.error(`  ${action}`);
    console.error('==================================================================\n');
    process.exit(1);
  }
};

export default connectDB;
