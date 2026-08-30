const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const script = readFileSync(`${__dirname}/../script.js`, 'utf8');

const directionalParts = ['body', 'head', 'leftleg', 'lhand', 'rhand', 'rightleg'];

test('contains a left-facing illustration for every robot part', () => {
  directionalParts.forEach((partName) => {
    assert.equal(existsSync(`${__dirname}/../images/${partName}_turn_left.svg`), true, partName);
    assert.match(script, new RegExp(`images/${partName}_turn_left\\.svg`));
  });
});

test('changes every part source through one direction helper', () => {
  const facingHelper = script.match(/function setRobotFacing\(direction\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(facingHelper, /ROBOT_PART_SOURCES\[direction\]/);
  assert.match(facingHelper, /partElements\[partName\]\.src = source/);
  assert.match(facingHelper, /robot\.dataset\.facing = direction/);
  assert.match(script, /window\.setRobotFacing = setRobotFacing/);
});

test('keeps calibrated part boxes stable when differently sized SVGs are swapped', () => {
  const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
  const applyConfig = script.match(/function applyConfigToPart\(partName\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(script, /head: \{[\s\S]*?width: 260,\s*height: 246,/);
  assert.match(script, /leftLeg: \{[\s\S]*?width: 120,\s*height: 211\.9,/);
  assert.match(script, /rightLeg: \{[\s\S]*?width: 120,\s*height: 156\.1,/);
  assert.match(applyConfig, /styles\.height = config\.height/);
  assert.match(css, /\.robot-part \{[\s\S]*?object-fit: contain/);
});

test('uses matching artwork while looking and while changing travel direction', () => {
  const lookAround = script.match(/function lookAround\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  const roam = script.match(/function roamAndDisappear\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(lookAround, /setRobotFacing\('left'\)[\s\S]*?setRobotFacing\('right'\)/);
  assert.match(roam, /setRobotFacing\('left'\)[\s\S]*?setRobotFacing\('right'\)/);
});

test('reset restores the normal right-facing artwork', () => {
  const stopAll = script.match(/function stopAllAnimations[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(stopAll, /if \(reset\) \{\s*setRobotFacing\('right'\)/);
});
