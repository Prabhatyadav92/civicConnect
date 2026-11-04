import { Router } from 'express';
import { z } from 'zod';
import { Report } from '../models/Report.js';
import { Department } from '../models/Department.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload, removeFiles } from '../middleware/upload.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { CATEGORY_IDS, STATUS_IDS, canTransition } from '../lib/constants.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().trim().min(3, 'Add a short title').max(120),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.enum(CATEGORY_IDS, { errorMap: () => ({ message: 'Choose a category' }) }),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  address: z.string().trim().max(200).optional().default(''),
});

const statusSchema = z.object({
  status: z.enum(STATUS_IDS),
  note: z.string().trim().max(500).optional().default(''),
});

const listSchema = z.object({
  status: z.enum(STATUS_IDS).optional(),
  category: z.enum(CATEGORY_IDS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Officials only see reports routed to their department. Admins see everything.
function scopeFor(user) {
  if (user.role === 'admin') return {};
  if (!user.department) throw new HttpError(403, 'Your account is not linked to a department yet');
  return { department: user.department };
}

function canView(user, report) {
  if (user.role === 'admin') return true;
  if (String(report.reporter?._id ?? report.reporter) === String(user._id)) return true;
  const dep = report.department?._id ?? report.department;
  return user.role === 'official' && dep && String(dep) === String(user.department);
}

const populate = [
  { path: 'reporter', select: 'name' },
  { path: 'department', select: 'name slug' },
  { path: 'statusHistory.by', select: 'name role' },
];

// Create a report (citizens)
router.post(
  '/',
  requireRole('citizen'),
  upload.array('media', 4),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw parsed.error;
      if (!files.length) throw new HttpError(400, 'Add at least one photo or video');

      const data = parsed.data;
      const department = await Department.findOne({ categories: data.category });
      const report = await Report.create({
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.address,
        location: { type: 'Point', coordinates: [data.lng, data.lat] },
        media: files.map((f) => ({
          url: `/uploads/${f.filename}`,
          kind: f.mimetype.startsWith('video') ? 'video' : 'image',
        })),
        reporter: req.user._id,
        department: department?._id,
        statusHistory: [{ status: 'submitted', note: 'Report received', by: req.user._id }],
      });
      await report.populate(populate);
      res.status(201).json({ report });
    } catch (err) {
      await removeFiles(files);
      throw err;
    }
  })
);

// The signed-in citizen's own reports
router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const reports = await Report.find({ reporter: req.user._id })
      .sort('-createdAt')
      .populate('department', 'name slug');
    res.json({ reports });
  })
);

// Dashboard numbers (officials, admins)
router.get(
  '/stats',
  requireRole('official', 'admin'),
  asyncHandler(async (req, res) => {
    const scope = scopeFor(req.user);
    const [byStatus, byCategory, resolution] = await Promise.all([
      Report.aggregate([{ $match: scope }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
      Report.aggregate([{ $match: scope }, { $group: { _id: '$category', n: { $sum: 1 } } }]),
      Report.aggregate([
        { $match: { ...scope, status: 'resolved', resolvedAt: { $ne: null } } },
        { $group: { _id: null, ms: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } },
      ]),
    ]);
    const statusCounts = Object.fromEntries(STATUS_IDS.map((s) => [s, 0]));
    byStatus.forEach((r) => (statusCounts[r._id] = r.n));
    res.json({
      total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      byStatus: statusCounts,
      byCategory: Object.fromEntries(byCategory.map((r) => [r._id, r.n])),
      avgResolutionHours: resolution[0] ? Math.round((resolution[0].ms / 36e5) * 10) / 10 : null,
    });
  })
);

// Department queue (officials, admins)
router.get(
  '/',
  requireRole('official', 'admin'),
  asyncHandler(async (req, res) => {
    const { status, category, page, limit } = listSchema.parse(req.query);
    const filter = { ...scopeFor(req.user) };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      Report.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reporter', 'name')
        .populate('department', 'name slug'),
      Report.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id).populate(populate);
    if (!report || !canView(req.user, report)) throw new HttpError(404, 'We could not find that report');
    res.json({ report });
  })
);

// Move a report to its next status (officials, admins)
router.patch(
  '/:id/status',
  requireRole('official', 'admin'),
  asyncHandler(async (req, res) => {
    const { status, note } = statusSchema.parse(req.body);
    const report = await Report.findById(req.params.id);
    if (!report || !canView(req.user, report)) throw new HttpError(404, 'We could not find that report');

    if (!canTransition(report.status, status)) {
      throw new HttpError(409, `A ${report.status.replace('_', ' ')} report cannot move to ${status.replace('_', ' ')}`);
    }
    if (status === 'rejected' && !note) throw new HttpError(400, 'Add a reason when you reject a report');

    report.status = status;
    report.statusHistory.push({ status, note, by: req.user._id });
    if (status === 'resolved') report.resolvedAt = new Date();
    await report.save();
    await report.populate(populate);
    res.json({ report });
  })
);

export default router;
