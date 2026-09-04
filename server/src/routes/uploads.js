import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Files are held in memory just long enough to stream to Cloudinary, never
// written to Render's (or any host's) local disk — that disk isn't
// permanent, so anything saved there disappears on the next restart/redeploy.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
    }
    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ultraboyz', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/uploads - any logged-in user can upload a photo. Returns a
// permanent Cloudinary URL that can be dropped straight into photo_url /
// cover_photo_url fields.
router.post('/', requireAuth, (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Photo storage isn\u2019t configured on the server yet (missing Cloudinary env vars).' });
    }

    try {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      res.status(201).json({ url: result.secure_url });
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(500).json({ error: 'Could not upload that photo.' });
    }
  });
});

export default router;
