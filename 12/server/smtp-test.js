import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// הדפס את הערכים מה־env
console.log('🔎 טעינת ערכים מה־.env:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '(נמצא)' : '(חסר)');

// יצירת חיבור
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // פורט 465 -> SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// בדיקת התחברות
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ שגיאה בהתחברות ל-SMTP:');
    console.error(error);
  } else {
    console.log('✅ התחברות ל-SMTP הצליחה:');
    console.log(success);
  }
});
