// Creates departments plus demo accounts. Run with: npm run seed
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { DEPARTMENTS } from './lib/constants.js';
import { Department } from './models/Department.js';
import { User } from './models/User.js';

const PASSWORD = process.env.SEED_PASSWORD || 'ChangeMe123!';

await mongoose.connect(config.mongoUri);
const passwordHash = await bcrypt.hash(PASSWORD, 12);

const depts = {};
for (const d of DEPARTMENTS) {
  depts[d.slug] = await Department.findOneAndUpdate({ slug: d.slug }, d, { upsert: true, new: true });
}

const accounts = [
  { name: 'Admin', email: 'admin@civicconnect.local', role: 'admin' },
  { name: 'Demo Citizen', email: 'citizen@civicconnect.local', role: 'citizen' },
  ...DEPARTMENTS.map((d) => ({
    name: `${d.name} Officer`,
    email: `${d.slug}@civicconnect.local`,
    role: 'official',
    department: depts[d.slug]._id,
  })),
];

for (const a of accounts) {
  await User.findOneAndUpdate({ email: a.email }, { ...a, passwordHash }, { upsert: true });
}

console.log(`Seeded ${DEPARTMENTS.length} departments and ${accounts.length} accounts.`);
console.log(`Password for every demo account: ${PASSWORD}`);
console.table(accounts.map(({ email, role }) => ({ email, role })));
await mongoose.disconnect();
