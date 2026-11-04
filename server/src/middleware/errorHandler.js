import { ZodError } from 'zod';
import { config } from '../config.js';

export function notFound(_req, res) {
  res.status(404).json({ error: 'That page does not exist' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first.path.join('.') || 'input';
    return res.status(400).json({ error: `${field}: ${first.message}` });
  }
  if (err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Each file must be 20 MB or smaller'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Attach up to 4 files'
        : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err.name === 'CastError') return res.status(404).json({ error: 'We could not find that item' });
  if (err.code === 11000) return res.status(409).json({ error: 'That value is already in use' });

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 && config.env === 'production' ? 'Something went wrong on our side' : err.message,
  });
}
