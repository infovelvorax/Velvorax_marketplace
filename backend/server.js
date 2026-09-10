import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Explicitly load backend/.env before anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { verifyEmailTransport } from './src/services/email.service.js';
import { syncUserEmailIndexes } from './src/utils/syncUserEmailIndexes.js';
import { syncAdminUser } from './src/utils/syncAdminUser.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Safely verify & backfill emailNormalized indexes without deleting user data
    await syncUserEmailIndexes();

    // Safely verify & synchronize administrator account
    await syncAdminUser();

    // Verify SMTP connection safely on startup
    await verifyEmailTransport();


    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
        console.error(`To resolve this, please terminate the process currently using port ${PORT} or check running Node instances before starting the server.\n`);
      } else {
        console.error(`\n[Server Error] Failed to start server: ${error.message}\n`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`\n[Startup Error] Database connection failed: ${error.message}\n`);
    process.exit(1);
  }
};

startServer();
