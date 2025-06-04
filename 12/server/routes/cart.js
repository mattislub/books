// routes/cart.js
import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// טען את עגלת הקניות
router.get('/', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const result = await pool.query(
      'SELECT items FROM carts WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (result.rows.length > 0) {
      res.json({ items: result.rows[0].items });
    } else {
      res.json({ items: [] });
    }
  } catch (err) {
    console.error('GET /api/cart error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// שמור/עדכן עגלה
router.post('/', async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    await pool.query(`
      INSERT INTO carts (user_id, items, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()
    `, [userId, JSON.stringify(items)]);

    res.json({ message: 'Cart saved' });
  } catch (err) {
    console.error('POST /api/cart error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
