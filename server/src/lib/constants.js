export const CATEGORIES = [
  { id: 'pothole', label: 'Pothole' },
  { id: 'damaged_road', label: 'Damaged road' },
  { id: 'garbage', label: 'Garbage' },
  { id: 'water_leak', label: 'Water leak' },
  { id: 'streetlight', label: 'Broken streetlight' },
  { id: 'other', label: 'Something else' },
];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export const STATUSES = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'rejected', label: 'Rejected' },
];
export const STATUS_IDS = STATUSES.map((s) => s.id);

// Which statuses an official may move a report to, from each status.
export const TRANSITIONS = {
  submitted: ['assigned', 'in_progress', 'rejected'],
  assigned: ['in_progress', 'resolved', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export const ROLES = ['citizen', 'official', 'admin'];

// Category -> department routing used when a report is created.
export const DEPARTMENTS = [
  { name: 'Roads and Works', slug: 'roads', categories: ['pothole', 'damaged_road'] },
  { name: 'Sanitation', slug: 'sanitation', categories: ['garbage'] },
  { name: 'Water Supply', slug: 'water', categories: ['water_leak'] },
  { name: 'Electricity and Lighting', slug: 'lighting', categories: ['streetlight'] },
  { name: 'General Administration', slug: 'general', categories: ['other'] },
];
