import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    categories: [{ type: String }],
  },
  { timestamps: true }
);
departmentSchema.index({ categories: 1 });

export const Department = mongoose.model('Department', departmentSchema);
