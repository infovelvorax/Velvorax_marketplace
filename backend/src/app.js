import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { sanitizeInput } from './middleware/sanitize.middleware.js';
import { rateLimitApi } from './middleware/rateLimit.middleware.js';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import locationRoutes from './routes/location.routes.js';
import listingRoutes from './routes/listing.routes.js';
import chatRoutes from './routes/chat.routes.js';
import offerRoutes from './routes/offer.routes.js';
import jobRoutes from './routes/job.routes.js';
import serviceRoutes from './routes/service.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import savedSearchRoutes from './routes/savedSearch.routes.js';
import orderRoutes from './routes/order.routes.js';
import { marketplaceAiRouter, buyerAiRouter, sellerAiRouter, adminAiRouter } from './routes/ai.routes.js';

dotenv.config();

const app = express();

// 1. HTTP Security Headers (Helmet with custom CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
          'https://*.tile.openstreetmap.org'
        ],
        connectSrc: ["'self'", 'https://api.cloudinary.com', 'https://*.tile.openstreetmap.org'],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5000'
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or non-browser tooling with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation: Origin not allowed.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 3. Strict Request Size Limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. NoSQL Injection & Payload Sanitization
app.use(sanitizeInput);

// 5. Request Logging (Minimal in production)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// 6. Static Uploads Folder (Isolated with security headers)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  dotfiles: 'ignore',
  index: false,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// 7. Health Check Endpoint (Safe diagnostics, no credentials leaked)
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = stateMap[readyState] || 'disconnected';
  const isHealthy = readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    server: 'running',
    database: {
      status: dbStatus,
      connected: isHealthy
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 8. General API Rate Limiting for Marketplace Routes
app.use('/api/marketplace', rateLimitApi);

// 9. Mount Marketplace API Routes
app.use('/api/marketplace/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/marketplace/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/marketplace/categories', categoryRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/marketplace/locations', locationRoutes);
app.use('/api/locations', locationRoutes);

app.use('/api/marketplace/listings', listingRoutes);
app.use('/api/marketplace/orders', orderRoutes);
app.use('/api/marketplace/saved-searches', savedSearchRoutes);
app.use('/api/marketplace/conversations', chatRoutes);
app.use('/api/marketplace/offers', offerRoutes);
app.use('/api/marketplace/jobs', jobRoutes);
app.use('/api/marketplace/services', serviceRoutes);
app.use('/api/marketplace/favorites', favoriteRoutes);
app.use('/api/marketplace/notifications', notificationRoutes);
app.use('/api/marketplace/reports', reportRoutes);
app.use('/api/marketplace/upload', uploadRoutes);

// 10. Mount AI Routes
app.use('/api/marketplace/ai', marketplaceAiRouter);
app.use('/api/ai', marketplaceAiRouter);
app.use('/api/marketplace/ai/buyer', buyerAiRouter);
app.use('/api/marketplace/ai/seller', sellerAiRouter);
app.use('/api/marketplace/admin/ai', adminAiRouter);
app.use('/api/marketplace/ai/admin', adminAiRouter);
app.use('/api/admin/ai', adminAiRouter);
app.use('/marketplace/admin/ai', adminAiRouter);

// 11. Centralized Production-Safe Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  // Log error details securely server-side only
  console.error(`[Server Error ${statusCode}]:`, err.message);

  // Return clean, non-leaking message to client
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error'
  });
});

export default app;
