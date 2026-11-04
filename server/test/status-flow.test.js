import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransition,
  TRANSITIONS,
  STATUS_IDS,
  CATEGORY_IDS,
  DEPARTMENTS,
} from '../src/lib/constants.js';

test('a report can move forward through the normal flow', () => {
  assert.ok(canTransition('submitted', 'assigned'));
  assert.ok(canTransition('assigned', 'in_progress'));
  assert.ok(canTransition('in_progress', 'resolved'));
});

test('resolved and rejected reports are final', () => {
  for (const to of STATUS_IDS) {
    assert.equal(canTransition('resolved', to), false);
    assert.equal(canTransition('rejected', to), false);
  }
});

test('a report cannot jump straight from submitted to resolved', () => {
  assert.equal(canTransition('submitted', 'resolved'), false);
});

test('every transition target is a known status', () => {
  for (const targets of Object.values(TRANSITIONS)) {
    for (const t of targets) assert.ok(STATUS_IDS.includes(t));
  }
});

test('every category is routed to exactly one department', () => {
  for (const cat of CATEGORY_IDS) {
    const owners = DEPARTMENTS.filter((d) => d.categories.includes(cat));
    assert.equal(owners.length, 1, `${cat} should have one department`);
  }
});
