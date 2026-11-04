import { Router } from 'express';
import { CATEGORIES, STATUSES, TRANSITIONS } from '../lib/constants.js';
import { Department } from '../models/Department.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const departments = await Department.find().select('name slug categories').sort('name');
    res.json({ categories: CATEGORIES, statuses: STATUSES, transitions: TRANSITIONS, departments });
  })
);

export default router;
