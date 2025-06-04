import express from 'express';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pkg;
const pool = new Pool();
const router = express.Router();

// Middleware לאימות JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// שליפת רשימת משאלות
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// הוספת ספר לרשימה
router.post('/', authenticateToken, async (req, res) => {
  const { book_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO wishlist (user_id, book_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, book_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// מחיקת ספר מהרשימה
router.delete('/:bookId', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [req.user.id, bookId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
