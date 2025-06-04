import express from 'express';
import nodemailer from 'nodemailer';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const { Pool } = pkg;


const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    // בדיקה אם המייל כבר קיבל קופון
    const result = await pool.query(
      'SELECT id FROM coupons WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({ message: 'Coupon already sent to this email' });
    }

    // שמירה במסד + שליחה
    await pool.query('INSERT INTO coupons (email) VALUES ($1)', [email]);

    await transporter.sendMail({
      from: `"Bookstore" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'הנה הקופון שלך!',
      html: `<h2>🎉 קיבלת קופון!</h2><p>השתמש בקוד: <strong>BOOK10</strong> לקבלת 10% הנחה.</p><p>תקף לשבוע מיום קבלתו.</p>`
    });

    res.json({ message: 'Coupon sent' });
  } catch (err) {
    console.error('Coupon send error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
