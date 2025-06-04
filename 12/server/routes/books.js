import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./server/.env') });

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

// שליפת כל הספרים
router.get('/', async (req, res) => {
  try {
    const { search, is_new_arrival, is_new_in_market } = req.query;
    let query = 'SELECT * FROM books';
    const params = [];

    const filters = [];
    if (search) {
      params.push(`%${search}%`);
      filters.push(`title ILIKE $${params.length}`);
    }
    if (is_new_arrival) {
      params.push(is_new_arrival === 'true');
      filters.push(`is_new_arrival = $${params.length}`);
    }
    if (is_new_in_market) {
      params.push(is_new_in_market === 'true');
      filters.push(`is_new_in_market = $${params.length}`);
    }

    if (filters.length > 0) {
      query += ` WHERE ` + filters.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// הוספת ספר
router.post('/', async (req, res) => {
  try {
    const { title, description, price, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO books (title, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, price, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// עדכון ספר
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image_url } = req.body;
    const result = await pool.query(
      'UPDATE books SET title=$1, description=$2, price=$3, image_url=$4 WHERE id=$5 RETURNING *',
      [title, description, price, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// מחיקת ספר
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;
