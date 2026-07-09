const DEBUG_ROBOT = true;

const ROBOT_CONFIG = {
  robot: {
    x: 0,
    y: 0,
    rotate: -7,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '50% 56%',
    zIndex: 0,
    width: 450,
    top: 0,
    left: 0,
  },
  head: {
    left: 95,
    top: 20,
    width: 260,
    x: -15,
    y: -107,
    rotate: 1,
    scale: 1.15,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '50% 75.03%',
    zIndex: 6,
  },
  body: {
    left: 120,
    top: 150,
    width: 220,
    x: -8,
    y: -25,
    rotate: 5,
    scale: 0.81,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '50% 50%',
    zIndex: 3,
  },
  leftHand: {
    left: 45,
    top: 205,
    width: 120,
    x: 8,
    y: -68,
    rotate: -3,
    scale: 1.11,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '80% 15%',
    zIndex: 4,
  },
  rightHand: {
    left: 300,
    top: 130,
    width: 120,
    x: -38,
    y: -53,
    rotate: -6,
    scale: 1.95,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '15% 30%',
    zIndex: 2,
  },
  leftLeg: {
    left: 95,
    top: 330,
    width: 120,
    x: -12,
    y: -67,
    rotate: 19,
    scale: 1.02,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '60% 10%',
    zIndex: 4,
  },
  rightLeg: {
    left: 240,
    top: 330,
    width: 120,
    x: -32,
    y: -74,
    rotate: -10,
    scale: 1.28,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: '45% 10%',
    zIndex: 1,
  },
};

const CONFIG_FIELDS = [
  'x',
  'y',
  'rotate',
  'scale',
  'scaleX',
  'scaleY',
  'transformOriginX',
  'transformOriginY',
  'zIndex',
  'width',
  'top',
  'left',
];

const PART_NAMES = ['robot', 'head', 'body', 'leftHand', 'rightHand', 'leftLeg', 'rightLeg'];

const robot = document.querySelector('[data-part="robot"]');
const controls = document.querySelector('.controls');
const partElements = {
  robot,
  head: document.querySelector('[data-part="head"]'),
  body: document.querySelector('[data-part="body"]'),
  leftHand: document.querySelector('[data-part="leftHand"]'),
  rightHand: document.querySelector('[data-part="rightHand"]'),
  leftLeg: document.querySelector('[data-part="leftLeg"]'),
  rightLeg: document.querySelector('[data-part="rightLeg"]'),
};
const initialConfig = structuredClone(ROBOT_CONFIG);
const debugInputs = new Map();
const originDots = new Map();

let selectedPart = 'head';
let idleTimeline;
let talkTimeline;
let debugPanel;

function splitTransformOrigin(transformOrigin) {
  const [x = '50%', y = '50%'] = transformOrigin.split(' ');
  return { x: parseFloat(x), y: parseFloat(y) };
}

function joinTransformOrigin(x, y) {
  return `${x}% ${y}%`;
}

function getDebugValue(partName, field) {
  const config = ROBOT_CONFIG[partName];

  if (field === 'transformOriginX') return splitTransformOrigin(config.transformOrigin).x;
  if (field === 'transformOriginY') return splitTransformOrigin(config.transformOrigin).y;

  return config[field] ?? 0;
}

function setDebugValue(partName, field, value) {
  const config = ROBOT_CONFIG[partName];
  const numericValue = Number(value);

  if (field === 'transformOriginX' || field === 'transformOriginY') {
    const origin = splitTransformOrigin(config.transformOrigin);

    if (field === 'transformOriginX') origin.x = numericValue;
    if (field === 'transformOriginY') origin.y = numericValue;

    config.transformOrigin = joinTransformOrigin(origin.x, origin.y);
    return;
  }

  config[field] = numericValue;
}

function applyConfigToPart(partName) {
  const element = partElements[partName];
  const config = ROBOT_CONFIG[partName];
  const styles = {
    x: config.x,
    y: config.y,
    rotate: config.rotate,
    scale: config.scale,
    scaleX: config.scaleX,
    scaleY: config.scaleY,
    transformOrigin: config.transformOrigin,
    zIndex: config.zIndex,
    width: config.width,
  };

  if (partName !== 'robot') {
    styles.position = 'absolute';
    styles.left = config.left;
    styles.top = config.top;
    styles.width = config.width;
  }

  gsap.set(element, styles);
}

function applyRobotConfig() {
  PART_NAMES.forEach(applyConfigToPart);
  updateOriginDots();
  updateSelectedHighlight();
}

function base(partName) {
  return ROBOT_CONFIG[partName];
}

function buildIdleTimeline() {
  const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

  timeline
    .to(robot, { y: base('robot').y - 8, duration: 1.45 }, 0)
    .to(robot, { y: base('robot').y, duration: 1.45 }, 1.45)
    .to(partElements.body, { scaleY: base('body').scaleY + 0.025, y: base('body').y - 3, duration: 1.45 }, 0)
    .to(partElements.body, { scaleY: base('body').scaleY, y: base('body').y, duration: 1.45 }, 1.45)
    .to(partElements.head, { rotate: base('head').rotate + 4.5, y: base('head').y - 4, duration: 1.45 }, 0)
    .to(partElements.head, { rotate: base('head').rotate, y: base('head').y, duration: 1.45 }, 1.45)
    .to(partElements.leftHand, { rotate: base('leftHand').rotate + 5, y: base('leftHand').y - 3, duration: 1.45 }, 0)
    .to(partElements.leftHand, { rotate: base('leftHand').rotate, y: base('leftHand').y, duration: 1.45 }, 1.45)
    .to(partElements.rightHand, { rotate: base('rightHand').rotate + 10, y: base('rightHand').y - 4, duration: 1.45 }, 0)
    .to(partElements.rightHand, { rotate: base('rightHand').rotate, y: base('rightHand').y, duration: 1.45 }, 1.45)
    .to(partElements.leftLeg, { rotate: base('leftLeg').rotate - 4, x: base('leftLeg').x - 2, duration: 1.45 }, 0)
    .to(partElements.leftLeg, { rotate: base('leftLeg').rotate, x: base('leftLeg').x, duration: 1.45 }, 1.45)
    .to(partElements.rightLeg, { rotate: base('rightLeg').rotate + 5, x: base('rightLeg').x + 2, duration: 1.45 }, 0)
    .to(partElements.rightLeg, { rotate: base('rightLeg').rotate, x: base('rightLeg').x, duration: 1.45 }, 1.45);

  return timeline;
}

function pauseAnimations() {
  idleTimeline?.pause();
  talkTimeline?.pause();
  gsap.getTweensOf(Object.values(partElements)).forEach((tween) => tween.pause());
}

function resumeAnimations() {
  idleTimeline?.resume();
  talkTimeline?.resume();
  gsap.getTweensOf(Object.values(partElements)).forEach((tween) => tween.resume());
}

function startIdle() {
  if (!idleTimeline) {
    idleTimeline = buildIdleTimeline();
  }

  idleTimeline.play();
}

function stopIdle() {
  idleTimeline?.pause();
}

function wave() {
  const wasIdleActive = idleTimeline && idleTimeline.isActive();

  if (wasIdleActive) idleTimeline.pause();

  return gsap.timeline({ defaults: { ease: 'sine.inOut' }, onComplete: () => wasIdleActive && idleTimeline.play() })
    .to(partElements.rightHand, { rotate: base('rightHand').rotate - 16, y: base('rightHand').y - 8, duration: 0.18 })
    .to(partElements.rightHand, { rotate: base('rightHand').rotate + 24, duration: 0.2, repeat: 5, yoyo: true })
    .to(partElements.rightHand, { rotate: base('rightHand').rotate, y: base('rightHand').y, duration: 0.28 });
}

function talkStart() {
  talkTimeline?.kill();

  talkTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })
    .to(partElements.head, { y: base('head').y - 3, scaleY: base('head').scaleY - 0.015, duration: 0.12 })
    .to(partElements.head, { y: base('head').y, scaleY: base('head').scaleY, duration: 0.12 })
    .to(partElements.head, { rotate: base('head').rotate + 1.5, duration: 0.1 })
    .to(partElements.head, { rotate: base('head').rotate, duration: 0.1 });
}

function talkStop() {
  if (!talkTimeline) return;

  talkTimeline.kill();
  talkTimeline = null;
  gsap.to(partElements.head, {
    scaleY: base('head').scaleY,
    y: base('head').y,
    rotate: base('head').rotate,
    duration: 0.2,
    ease: 'sine.out',
  });
}

function createDebugPanel() {
  debugPanel = document.createElement('aside');
  debugPanel.className = 'debug-panel';
  debugPanel.innerHTML = `
    <h2>Robot Debug Editor</h2>
    <label>
      Part
      <select data-debug-part>
        ${PART_NAMES.map((partName) => `<option value="${partName}">${partName}</option>`).join('')}
      </select>
    </label>
    <div class="debug-fields"></div>
    <div class="debug-actions">
      <button type="button" data-debug-action="pause">Pause animations</button>
      <button type="button" data-debug-action="resume">Resume animations</button>
      <button type="button" data-debug-action="reset">Reset selected part</button>
      <button type="button" data-debug-action="copy">Copy current config</button>
    </div>
    <p class="debug-help">Shortcuts: arrows move 1px, Shift+arrows move 10px, [ / ] rotate 1°, Shift+[ / Shift+] rotate 5°, Tab cycles parts.</p>
  `;
  document.body.appendChild(debugPanel);

  const select = debugPanel.querySelector('[data-debug-part]');
  select.value = selectedPart;
  select.addEventListener('change', () => selectPart(select.value));

  debugPanel.addEventListener('input', (event) => {
    const input = event.target.closest('[data-debug-field]');
    if (!input) return;

    setDebugValue(selectedPart, input.dataset.debugField, input.value);
    applyConfigToPart(selectedPart);
    updateOriginDots();
    updateSelectedHighlight();
  });

  debugPanel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-debug-action]');
    if (!button) return;

    const actions = {
      pause: pauseAnimations,
      resume: resumeAnimations,
      reset: resetSelectedPart,
      copy: copyCurrentConfig,
    };

    actions[button.dataset.debugAction]?.();
  });

  renderDebugFields();
}

function renderDebugFields() {
  const fields = debugPanel.querySelector('.debug-fields');
  fields.innerHTML = '';
  debugInputs.clear();

  CONFIG_FIELDS.forEach((field) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'number';
    input.step = field.includes('transformOrigin') || field.includes('scale') ? '0.01' : '1';
    input.value = getDebugValue(selectedPart, field);
    input.dataset.debugField = field;
    label.textContent = field;
    label.appendChild(input);
    fields.appendChild(label);
    debugInputs.set(field, input);
  });
}

function refreshDebugInputs() {
  CONFIG_FIELDS.forEach((field) => {
    const input = debugInputs.get(field);
    if (input) input.value = getDebugValue(selectedPart, field);
  });
}

function selectPart(partName) {
  selectedPart = partName;
  debugPanel.querySelector('[data-debug-part]').value = selectedPart;
  renderDebugFields();
  updateOriginDots();
  updateSelectedHighlight();
}

function createOriginDots() {
  PART_NAMES.forEach((partName) => {
    const dot = document.createElement('span');
    dot.className = 'origin-dot';
    dot.dataset.originDot = partName;
    dot.title = `${partName} transform origin`;
    robot.appendChild(dot);
    originDots.set(partName, dot);
  });

  updateOriginDots();
}

function getOriginDotPosition(partName) {
  const config = ROBOT_CONFIG[partName];
  const { x, y } = splitTransformOrigin(config.transformOrigin);

  if (partName === 'robot') {
    return {
      left: (config.width || robot.offsetWidth) * (x / 100),
      top: robot.offsetHeight * (y / 100),
    };
  }

  const element = partElements[partName];
  return {
    left: config.left + config.width * (x / 100),
    top: config.top + element.offsetHeight * (y / 100),
  };
}

function updateOriginDots() {
  if (!DEBUG_ROBOT || originDots.size === 0) return;

  PART_NAMES.forEach((partName) => {
    const dot = originDots.get(partName);
    const position = getOriginDotPosition(partName);
    dot.style.left = `${position.left}px`;
    dot.style.top = `${position.top}px`;
    dot.classList.toggle('is-selected', partName === selectedPart);
  });
}

function updateSelectedHighlight() {
  if (!DEBUG_ROBOT) return;

  PART_NAMES.forEach((partName) => {
    partElements[partName].classList.toggle('debug-selected', partName === selectedPart);
  });
}

function resetSelectedPart() {
  ROBOT_CONFIG[selectedPart] = structuredClone(initialConfig[selectedPart]);
  applyConfigToPart(selectedPart);
  refreshDebugInputs();
  updateOriginDots();
  updateSelectedHighlight();
}

function formatConfigForCopy() {
  return `const ROBOT_CONFIG = ${JSON.stringify(ROBOT_CONFIG, null, 2).replace(/"([^"\\]+)":/g, '$1:')};`;
}

async function copyCurrentConfig() {
  const output = formatConfigForCopy();
  console.log(output);

  try {
    await navigator.clipboard.writeText(output);
  } catch (error) {
    console.warn('Clipboard copy failed. Config was logged to the console instead.', error);
  }
}

function moveSelectedPart(deltaX, deltaY) {
  ROBOT_CONFIG[selectedPart].x += deltaX;
  ROBOT_CONFIG[selectedPart].y += deltaY;
  applyConfigToPart(selectedPart);
  refreshDebugInputs();
}

function rotateSelectedPart(delta) {
  ROBOT_CONFIG[selectedPart].rotate += delta;
  applyConfigToPart(selectedPart);
  refreshDebugInputs();
}

function handleDebugKeyboard(event) {
  if (!DEBUG_ROBOT) return;

  const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
  if (isTyping && event.key !== 'Tab') return;

  const moveAmount = event.shiftKey ? 10 : 1;
  const rotateAmount = event.shiftKey ? 5 : 1;
  const actions = {
    ArrowUp: () => moveSelectedPart(0, -moveAmount),
    ArrowDown: () => moveSelectedPart(0, moveAmount),
    ArrowLeft: () => moveSelectedPart(-moveAmount, 0),
    ArrowRight: () => moveSelectedPart(moveAmount, 0),
    '[': () => rotateSelectedPart(-rotateAmount),
    ']': () => rotateSelectedPart(rotateAmount),
    Tab: () => selectPart(PART_NAMES[(PART_NAMES.indexOf(selectedPart) + 1) % PART_NAMES.length]),
  };
  const action = actions[event.key];

  if (!action) return;

  event.preventDefault();
  action();
}

applyRobotConfig();
startIdle();

if (DEBUG_ROBOT) {
  pauseAnimations();
  createDebugPanel();
  window.addEventListener('load', updateOriginDots);
  window.addEventListener('keydown', handleDebugKeyboard);
  createOriginDots();
}

window.ROBOT_CONFIG = ROBOT_CONFIG;
window.startIdle = startIdle;
window.stopIdle = stopIdle;
window.wave = wave;
window.talkStart = talkStart;
window.talkStop = talkStop;

controls.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const actions = {
    idle: startIdle,
    stop: stopIdle,
    wave,
    talk: talkStart,
    'talk-stop': talkStop,
  };

  actions[button.dataset.action]?.();
});
