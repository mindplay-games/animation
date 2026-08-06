const { existsSync, readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const moduleSource = readFileSync(`${__dirname}/../portable-robot/robot-character.js`, 'utf8');
const css = readFileSync(`${__dirname}/../portable-robot/robot-character.css`, 'utf8');
const guide = readFileSync(`${__dirname}/../portable-robot/README.md`, 'utf8');

const assetNames = ['body.svg', 'head.svg', 'leftleg.svg', 'lhand.svg', 'rhand.svg', 'rightleg.svg'];

test('portable package contains every calibrated SVG part', () => {
  assetNames.forEach((assetName) => {
    assert.equal(existsSync(`${__dirname}/../portable-robot/assets/${assetName}`), true, assetName);
    assert.match(moduleSource, new RegExp(`data-file="${assetName.replace('.', '\\.')}"`));
  });
});

test('portable runtime exposes all supported animations and lifecycle methods', () => {
  assert.match(moduleSource, /export async function createRobot/);
  assert.match(moduleSource, /const actions = \{ idle: startIdle, inspired: startInspiredIdle, wave, floatWaveAndSway, lookAround, nod, bounce, ponder, dance, talk: talkStart \}/);
  assert.match(moduleSource, /stop\(\).*stopAllAnimations/);
  assert.match(moduleSource, /destroy\(\)/);
  assert.match(moduleSource, /robot:actionchange/);
});

test('portable styles are scoped to the mount and preserve calibrated dimensions', () => {
  assert.match(css, /\.portable-robot \{/);
  assert.match(css, /--portable-robot-width: 390px/);
  assert.match(css, /--portable-robot-height: 500px/);
  assert.match(css, /\.portable-robot \.robot-part/);
  assert.doesNotMatch(css, /(^|\n)body\s*\{/);
});

test('English guide documents installation, API, lifecycle, and troubleshooting', () => {
  assert.match(guide, /## Basic installation/);
  assert.match(guide, /## Animation API/);
  assert.match(guide, /## Lifecycle in single-page applications/);
  assert.match(guide, /## Correct integration checklist/);
  assert.match(guide, /## Troubleshooting/);
});
