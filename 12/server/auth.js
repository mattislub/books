// auth.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('auth route works');
});

export default router;

