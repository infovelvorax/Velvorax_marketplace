import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS;
  const cleanPass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  console.log('Testing SMTP with:');
  console.log('User:', user);
  console.log('Raw Pass length:', rawPass?.length);
  console.log('Clean Pass (no spaces) length:', cleanPass?.length);

  // Test 1: With clean pass (no spaces)
  const transporter1 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: user.trim(),
      pass: cleanPass
    }
  });

  try {
    await transporter1.verify();
    console.log('SUCCESS with cleanPass (no spaces)!');
    return;
  } catch (err) {
    console.log('Failed with cleanPass:', err.message);
  }

  // Test 2: Port 465 SSL
  const transporter2 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user.trim(),
      pass: cleanPass
    }
  });

  try {
    await transporter2.verify();
    console.log('SUCCESS with Port 465 SSL!');
    return;
  } catch (err) {
    console.log('Failed with Port 465:', err.message);
  }
}

test();
