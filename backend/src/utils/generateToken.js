import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (id, role = 'BUYER') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
};


