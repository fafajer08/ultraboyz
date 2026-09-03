import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function publicUser(row) {
  const { password_hash, ...rest } = row;
  return rest;
}

// GET /api/members - public roster, legendary/gold first
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      ORDER BY
        CASE rarity WHEN 'legendary' THEN 1 WHEN 'gold' THEN 2 WHEN 'silver' THEN 3 ELSE 4 END,
        crew_number ASC
    `);
    res.json(result.rows.map(publicUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load the roster.' });
  }
});

// GET /api/members/:id - public single profile
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No runner with that id.' });
    res.json(publicUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load that runner.' });
  }
});

// POST /api/members - ADMIN ONLY. Recruit a member with a login of their own.
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const {
    name, email, password, role, alias, crew_number, photo_url,
    pace_min_per_km, longest_run_km, personal_record, bio, rarity,
  } = req.body;

  if (!name || !email || !password || !crew_number) {
    return res.status(400).json({ error: 'name, email, password and crew_number are required.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, role, alias, crew_number, photo_url, pace_min_per_km, longest_run_km, personal_record, bio, rarity)
       VALUES ($1,$2,$3,COALESCE($4,'user'),$5,$6,$7,$8,$9,$10,$11,COALESCE($12,'bronze'))
       RETURNING *`,
      [name, email.toLowerCase(), hash, role, alias || name, crew_number, photo_url,
       pace_min_per_km, longest_run_km, personal_record, bio, rarity]
    );
    res.status(201).json(publicUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'That email or crew number is already taken.' });
    res.status(500).json({ error: 'Could not add that runner.' });
  }
});

// PUT /api/members/:id - self can edit own profile, admin can edit anyone.
// A non-admin user is never allowed to edit an admin's profile (including their own if
// somehow promoted client-side — role is always re-checked server-side).
router.put('/:id', requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    const existing = await pool.query('SELECT * FROM users WHERE id = $1', [targetId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'No runner with that id.' });
    const target = existing.rows[0];

    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'You can only edit your own profile.' });
    }
    if (!isAdmin && target.role === 'admin') {
      return res.status(403).json({ error: 'You cannot edit an admin profile.' });
    }

    // Fields any owner (self or admin) can change:
    const { name, alias, photo_url, pace_min_per_km, longest_run_km, personal_record, bio, password } = req.body;
    // Fields only an admin can change:
    const { role, crew_number, rarity, email } = req.body;

    const fields = { name, alias, photo_url, pace_min_per_km, longest_run_km, personal_record, bio };
    if (isAdmin) {
      Object.assign(fields, { role, crew_number, rarity, email: email ? email.toLowerCase() : undefined });
    }

    let passwordHash = target.password_hash;
    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      passwordHash = await bcrypt.hash(password, 10);
    }

    const merged = { ...target, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)), password_hash: passwordHash };

    const result = await pool.query(
      `UPDATE users SET
        name=$1, alias=$2, photo_url=$3, pace_min_per_km=$4, longest_run_km=$5,
        personal_record=$6, bio=$7, role=$8, crew_number=$9, rarity=$10, email=$11, password_hash=$12
       WHERE id=$13 RETURNING *`,
      [merged.name, merged.alias, merged.photo_url, merged.pace_min_per_km, merged.longest_run_km,
       merged.personal_record, merged.bio, merged.role, merged.crew_number, merged.rarity, merged.email,
       merged.password_hash, targetId]
    );
    res.json(publicUser(result.rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'That email or crew number is already taken.' });
    res.status(500).json({ error: 'Could not update that profile.' });
  }
});

// DELETE /api/members/:id - ADMIN ONLY
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No runner with that id.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove that runner.' });
  }
});

export default router;
