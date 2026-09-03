import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

function publicUser(row) {
  const { password_hash, ...rest } = row;
  return rest;
}

// POST /api/auth/register - anyone can self-register as a regular crew member
router.post('/register', async (req, res) => {
  const { name, email, password, alias } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const nextNum = await pool.query('SELECT COALESCE(MAX(crew_number), 0) + 1 AS next FROM users');
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, alias, crew_number, rarity)
       VALUES ($1,$2,$3,'user',$4,$5,'bronze')
       RETURNING *`,
      [name, email.toLowerCase(), hash, alias || name, nextNum.rows[0].next]
    );

    const user = publicUser(result.rows[0]);
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create that account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const row = result.rows[0];
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const user = publicUser(row);
    res.json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not log in.' });
  }
});

// GET /api/auth/me - whoami, given a valid token (mounted with attachUser upstream)
router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Account no longer exists.' });
    res.json(publicUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load your account.' });
  }
});

export default router;
