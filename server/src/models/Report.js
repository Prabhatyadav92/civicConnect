import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { CATEGORY_IDS, STATUS_IDS } from '../lib/constants.js';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    kind: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS_IDS, required: true },
    note: { type: String, default: '', maxlength: 500 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      default: () => `CC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 1000 },
    category: { type: String, enum: CATEGORY_IDS, required: true },
    status: { type: String, enum: STATUS_IDS, default: 'submitted', index: true },
    media: [mediaSchema],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, default: '', maxlength: 200 },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    statusHistory: [historySchema],
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
