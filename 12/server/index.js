import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import couponRoutes from './routes/coupon.js';
import booksRouter from './routes/books.js';
import cartRoutes from './routes/cart.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// חיבור המסלול של קופונים
app.use('/api/coupon', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/books', booksRouter); 

// הפעלת השרת
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


