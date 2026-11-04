import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { HttpError } from '../lib/httpError.js';

// Extension comes from the verified mimetype, never from the client's filename.
const EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

fs.mkdirSync(config.uploadDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[file.mimetype]}`),
  }),
  fileFilter: (_req, file, cb) =>
    EXT[file.mimetype]
      ? cb(null, true)
      : cb(new HttpError(400, 'Upload a JPG, PNG, WebP, MP4 or WebM file')),
  limits: { fileSize: 20 * 1024 * 1024, files: 4 },
});

export async function removeFiles(files = []) {
  await Promise.all(
    files.map((f) => fs.promises.unlink(path.join(config.uploadDir, f.filename)).catch(() => {}))
  );
}
