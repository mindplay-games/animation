const { readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const script = readFileSync(`${__dirname}/../script.js`, 'utf8');
const markup = readFileSync(`${__dirname}/../index.html`, 'utf8');
const animation = script.match(/function roamAndDisappear\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';

test('registers the roam and disappear control and public action', () => {
  assert.match(markup, /data-action="roamAndDisappear"[^>]*>Roam &amp; Disappear<\/button>/);
  assert.match(script, /window\.roamAndDisappear = roamAndDisappear/);
  assert.match(script, /const actions = \{[\s\S]*?roamAndDisappear,/);
});

test('uses responsive stage bounds for a multi-point journey', () => {
  assert.match(animation, /getBoundingClientRect\(\)/);
  assert.match(animation, /horizontalRange/);
  assert.match(animation, /verticalRange/);
  assert.ok((animation.match(/\.to\(robotWrapper/g) ?? []).length >= 4);
});

test('keeps the roaming journey slow and easy to follow', () => {
  const wrapperDurations = [...animation.matchAll(/\.to\(robotWrapper, \{[\s\S]*?duration: ([\d.]+)/g)].map((match) => Number(match[1]));
  assert.deepEqual(wrapperDurations, [1.6, 2.1, 1.8, 1.5]);
  assert.ok(wrapperDurations.reduce((total, duration) => total + duration, 0) >= 7);
});

test('fades the robot and its shadow at the end', () => {
  assert.match(animation, /opacity: 0,[\s\S]*?ease: 'power2\.in'/);
  assert.match(animation, /\.to\(shadow, \{[^}]*opacity: 0/);
});

test('Stop interrupts the journey and restores visibility', () => {
  const stopAll = script.match(/function stopAllAnimations[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(stopAll, /roamAndDisappearTimeline\?\.kill\(\)/);
  assert.match(stopAll, /roamAndDisappearTimeline = null/);
  assert.match(stopAll, /x: 0/);
  assert.match(stopAll, /opacity: 1/);
});
