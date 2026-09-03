import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/events - public. Upcoming soonest-first, recent newest-first.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM events
      ORDER BY
        status ASC,
        CASE WHEN status = 'upcoming' THEN event_date END ASC,
        CASE WHEN status = 'recent' THEN event_date END DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load events.' });
  }
});

// GET /api/events/:id - public, with photo gallery
router.get('/:id', async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ error: 'No event with that id.' });
    const photosResult = await pool.query('SELECT * FROM event_photos WHERE event_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json({ ...eventResult.rows[0], photos: photosResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load that event.' });
  }
});

// POST /api/events - ADMIN ONLY. Full event creation (upcoming or recent).
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, event_date, distance, location, notes, status, cover_photo_url } = req.body;
  if (!title || !event_date || !distance) {
    return res.status(400).json({ error: 'title, event_date and distance are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO events (title, event_date, distance, location, notes, status, cover_photo_url)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,'upcoming'),$7) RETURNING *`,
      [title, event_date, distance, location, notes, status, cover_photo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not post that event.' });
  }
});

// PUT /api/events/:id - ADMIN ONLY. Full edit of any field, including status.
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'No event with that id.' });
    const current = existing.rows[0];
    const { title, event_date, distance, location, notes, status, cover_photo_url } = req.body;
    const merged = {
      title: title ?? current.title, event_date: event_date ?? current.event_date,
      distance: distance ?? current.distance, location: location ?? current.location,
      notes: notes ?? current.notes, status: status ?? current.status,
      cover_photo_url: cover_photo_url ?? current.cover_photo_url,
    };
    const result = await pool.query(
      `UPDATE events SET title=$1, event_date=$2, distance=$3, location=$4, notes=$5, status=$6, cover_photo_url=$7
       WHERE id=$8 RETURNING *`,
      [merged.title, merged.event_date, merged.distance, merged.location, merged.notes, merged.status, merged.cover_photo_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update that event.' });
  }
});

// DELETE /api/events/:id - ADMIN ONLY
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No event with that id.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove that event.' });
  }
});

// POST /api/events/:id/photos - any logged-in user, but only on RECENT events.
// Admins can add photos to any event regardless of status (part of full CRUD).
router.post('/:id/photos', requireAuth, async (req, res) => {
  const { photo_url, caption } = req.body;
  if (!photo_url) return res.status(400).json({ error: 'photo_url is required.' });

  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ error: 'No event with that id.' });
    const event = eventResult.rows[0];

    if (req.user.role !== 'admin' && event.status !== 'recent') {
      return res.status(403).json({ error: 'Photos can only be added to recent events.' });
    }

    const result = await pool.query(
      `INSERT INTO event_photos (event_id, photo_url, caption, added_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, photo_url, caption, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add that photo.' });
  }
});

// DELETE /api/events/:id/photos/:photoId - ADMIN ONLY
router.delete('/:id/photos/:photoId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM event_photos WHERE id = $1 AND event_id = $2 RETURNING id',
      [req.params.photoId, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No photo with that id on this event.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove that photo.' });
  }
});

export default router;
