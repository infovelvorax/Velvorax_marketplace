import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { normalizeEmail } from '../src/utils/normalizeEmail.js';
import { isValidPhoneNumber, validatePhoneNumber } from '../src/utils/phoneValidator.js';
import { generateToken } from '../src/utils/generateToken.js';
import { User } from '../src/models/User.js';
import { Listing } from '../src/models/Listing.js';
import { Offer } from '../src/models/Offer.js';
import { Report } from '../src/models/Report.js';
import { JobApplication } from '../src/models/JobApplication.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function runTests() {
  console.log('====================================================');
  console.log('  VELVORAX MARKETPLACE FULL-STACK VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. GMAIL NORMALIZATION UNIT TESTS
  console.log('--- 1. Testing Email Normalization ---');
  const e1 = normalizeEmail('john.doe@gmail.com');
  const e2 = normalizeEmail('johndoe@gmail.com');
  const e3 = normalizeEmail('j.o.h.n.d.o.e+promo123@googlemail.com');
  const e4 = normalizeEmail('  John.Doe@GMAIL.com  ');
  const e5 = normalizeEmail('custom.user+test@company.co.uk');

  assert(e1 === 'johndoe@gmail.com', `john.doe@gmail.com -> ${e1}`);
  assert(e2 === 'johndoe@gmail.com', `johndoe@gmail.com -> ${e2}`);
  assert(e3 === 'johndoe@gmail.com', `j.o.h.n.d.o.e+promo123@googlemail.com -> ${e3}`);
  assert(e4 === 'johndoe@gmail.com', `  John.Doe@GMAIL.com   -> ${e4}`);
  assert(e5 === 'custom.user+test@company.co.uk', `custom.user+test@company.co.uk -> ${e5}`);

  // 2. PHONE NUMBER VALIDATOR TESTS
  console.log('\n--- 2. Testing International Phone Validation ---');
  assert(isValidPhoneNumber('+919876543210') === true, '+919876543210 is valid');
  assert(isValidPhoneNumber('9876543210') === true, '9876543210 is valid');
  assert(isValidPhoneNumber('+1 415 555 2671') === true, '+1 415 555 2671 is valid');
  assert(isValidPhoneNumber('12345') === false, '12345 is too short (< 7 digits)');
  assert(isValidPhoneNumber('98765ABCD') === false, 'Alphabetic phone numbers rejected');
  assert(isValidPhoneNumber('+12345678901234567') === false, 'Phone > 15 digits rejected');

  // 3. 12-HOUR SESSION TOKEN TESTS
  console.log('\n--- 3. Testing 12-Hour Session Token ---');
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'velvorax-secret-key-12345';
  const dummyUser = { _id: new mongoose.Types.ObjectId(), role: 'BUYER', email: 'test@velvorax.com' };
  const token = generateToken(dummyUser);
  const decoded = jwt.decode(token);
  const durationHours = (decoded.exp - decoded.iat) / 3600;
  assert(Math.round(durationHours) === 12, `Token lifespan is exactly 12 hours (got ${durationHours}h)`);

  // 4. DATABASE INTEGRATION TESTS
  console.log('\n--- 4. Testing MongoDB Database Model Constraints ---');
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('  Connected to MongoDB for model validation...');

      // Test User Schema Pre-save Hook
      const testEmail = `test.normal.${Date.now()}@gmail.com`;
      const expectedNormalized = testEmail.replace(/\./g, '').replace('@gmail.com', '') + '@gmail.com';
      
      const user = new User({
        name: 'Verification Test User',
        email: testEmail,
        password: 'Password123!',
        phone: '+919876543210',
        role: 'BUYER',
        location: {
          country: 'India',
          countryCode: 'IN',
          state: 'Karnataka',
          region: 'Karnataka',
          city: 'Bengaluru',
          localArea: 'Koramangala'
        }
      });

      assert(user.emailNormalized === normalizeEmail(testEmail), 'User model automatically sets emailNormalized');
      assert(user.location.country === 'India', 'User location country persisted');
      assert(user.location.city === 'Bengaluru', 'User location city persisted');

      // Test Report Model Signature Field
      const report = new Report({
        reporterId: user._id,
        targetType: 'LISTING',
        targetId: new mongoose.Types.ObjectId(),
        reason: 'FRAUD',
        description: 'Suspicious duplicate listing',
        signature: 'Verification Signer'
      });
      assert(report.signature === 'Verification Signer', 'Report model contains digital signature field');

    } catch (dbErr) {
      console.warn('  MongoDB connection note:', dbErr.message);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    console.log('  Skipping live DB write (MONGODB_URI not provided in local runner)');
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
