const robot = document.querySelector('.robot');
const controls = document.querySelector('.controls');

const CHARACTER_PARTS = {
  body: { x: 120, y: 186, w: 190, origin: '50% 50%', z: 3 },
  head: { x: 88, y: 28, w: 275, origin: '50% 75%', z: 6 },
  lhand: { x: 48, y: 242, w: 115, origin: '80% 15%', z: 4 },
  rhand: { x: 305, y: 154, w: 132, origin: '15% 30%', z: 5 },
  leftleg: { x: 104, y: 356, w: 118, origin: '60% 10%', z: 1 },
  rightleg: { x: 236, y: 350, w: 128, origin: '45% 10%', z: 2 },
};

const partElements = {
  body: document.querySelector('[data-part="body"]'),
  head: document.querySelector('[data-part="head"]'),
  lhand: document.querySelector('[data-part="lhand"]'),
  rhand: document.querySelector('[data-part="rhand"]'),
  leftleg: document.querySelector('[data-part="leftleg"]'),
  rightleg: document.querySelector('[data-part="rightleg"]'),
};

const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');
const debugDots = new Map();
let selectedPartIndex = 0;
let idleTimeline;
let talkTimeline;

function applyPartConfig() {
  Object.entries(CHARACTER_PARTS).forEach(([name, config]) => {
    const element = partElements[name];

    gsap.set(element, {
      position: 'absolute',
      left: config.x,
      top: config.y,
      width: config.w,
      transformOrigin: config.origin,
      zIndex: config.z,
    });
  });

  updateDebugDots();
}

function setInitialPose() {
  gsap.set(robot, { scale: 1, y: 0, rotate: -5 });
  gsap.set(partElements.head, { x: 0, y: 0, rotate: -2 });
  gsap.set(partElements.body, { x: 0, y: 0, rotate: -1, scaleY: 1 });
  gsap.set(partElements.lhand, { x: 0, y: 0, rotate: -11 });
  gsap.set(partElements.rhand, { x: 0, y: 0, rotate: -9 });
  gsap.set(partElements.leftleg, { x: 0, y: 0, rotate: 16 });
  gsap.set(partElements.rightleg, { x: 0, y: 0, rotate: -16 });
}

function buildIdleTimeline() {
  const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

  timeline
    .to(robot, { y: -8, duration: 1.45 }, 0)
    .to(robot, { y: 0, duration: 1.45 }, 1.45)
    .to(partElements.body, { scaleY: 1.025, y: -3, duration: 1.45 }, 0)
    .to(partElements.body, { scaleY: 1, y: 0, duration: 1.45 }, 1.45)
    .to(partElements.head, { rotate: 1.5, y: -4, duration: 1.45 }, 0)
    .to(partElements.head, { rotate: -2, y: 0, duration: 1.45 }, 1.45)
    .to(partElements.lhand, { rotate: -7, y: -3, duration: 1.45 }, 0)
    .to(partElements.lhand, { rotate: -11, y: 0, duration: 1.45 }, 1.45)
    .to(partElements.rhand, { rotate: 4, y: -4, duration: 1.45 }, 0)
    .to(partElements.rhand, { rotate: -9, y: 0, duration: 1.45 }, 1.45)
    .to(partElements.leftleg, { rotate: 12, x: -2, duration: 1.45 }, 0)
    .to(partElements.leftleg, { rotate: 16, x: 0, duration: 1.45 }, 1.45)
    .to(partElements.rightleg, { rotate: -12, x: 2, duration: 1.45 }, 0)
    .to(partElements.rightleg, { rotate: -16, x: 0, duration: 1.45 }, 1.45);

  return timeline;
}

function startIdle() {
  if (!idleTimeline) {
    idleTimeline = buildIdleTimeline();
  }

  idleTimeline.play();
}

function stopIdle() {
  if (idleTimeline) {
    idleTimeline.pause();
  }
}

function wave() {
  const wasIdleActive = idleTimeline && idleTimeline.isActive();

  if (wasIdleActive) {
    idleTimeline.pause();
  }

  return gsap.timeline({ defaults: { ease: 'sine.inOut' }, onComplete: () => wasIdleActive && idleTimeline.play() })
    .to(partElements.rhand, { rotate: -22, y: -8, duration: 0.18 })
    .to(partElements.rhand, { rotate: 18, duration: 0.2, repeat: 5, yoyo: true })
    .to(partElements.rhand, { rotate: -9, y: 0, duration: 0.28 });
}

function talkStart() {
  if (talkTimeline) {
    talkTimeline.kill();
  }

  talkTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })
    .to(partElements.head, { y: -3, scaleY: 0.985, duration: 0.12 })
    .to(partElements.head, { y: 0, scaleY: 1, duration: 0.12 })
    .to(partElements.head, { rotate: '+=1.5', duration: 0.1 })
    .to(partElements.head, { rotate: '-=1.5', duration: 0.1 });
}

function talkStop() {
  if (talkTimeline) {
    talkTimeline.kill();
    talkTimeline = null;
    gsap.to(partElements.head, { scaleY: 1, y: 0, duration: 0.2, ease: 'sine.out' });
  }
}

function parseOrigin(origin) {
  return origin.split(' ').map((value) => parseFloat(value) / 100);
}

function createDebugDots() {
  robot.classList.add('is-debugging');

  Object.keys(CHARACTER_PARTS).forEach((name) => {
    const dot = document.createElement('span');
    dot.className = 'debug-dot';
    dot.dataset.part = name;
    dot.title = `${name} transform origin`;
    robot.appendChild(dot);
    debugDots.set(name, dot);
  });

  updateSelectedDebugDot();
  updateDebugDots();
  console.info('Debug mode enabled. Press Tab to select a part, then use arrow keys to move it by 1px.');
  logConfig();
}

function updateDebugDots() {
  if (!DEBUG_MODE || debugDots.size === 0) return;

  Object.entries(CHARACTER_PARTS).forEach(([name, config]) => {
    const dot = debugDots.get(name);
    const element = partElements[name];
    const [originX, originY] = parseOrigin(config.origin);

    dot.style.left = `${config.x + config.w * originX}px`;
    dot.style.top = `${config.y + element.offsetHeight * originY}px`;
  });
}

function updateSelectedDebugDot() {
  if (!DEBUG_MODE) return;

  const selectedName = Object.keys(CHARACTER_PARTS)[selectedPartIndex];

  debugDots.forEach((dot, name) => {
    dot.classList.toggle('is-selected', name === selectedName);
  });
}

function logConfig() {
  console.info('CHARACTER_PARTS =', JSON.stringify(CHARACTER_PARTS, null, 2));
}

function cycleSelectedPart() {
  selectedPartIndex = (selectedPartIndex + 1) % Object.keys(CHARACTER_PARTS).length;
  updateSelectedDebugDot();
  console.info(`Selected part: ${Object.keys(CHARACTER_PARTS)[selectedPartIndex]}`);
}

function moveSelectedPart(deltaX, deltaY) {
  const selectedName = Object.keys(CHARACTER_PARTS)[selectedPartIndex];
  const config = CHARACTER_PARTS[selectedName];

  config.x += deltaX;
  config.y += deltaY;
  applyPartConfig();
  logConfig();
}

function handleDebugKeyboard(event) {
  if (!DEBUG_MODE) return;

  const keyActions = {
    ArrowUp: () => moveSelectedPart(0, -1),
    ArrowDown: () => moveSelectedPart(0, 1),
    ArrowLeft: () => moveSelectedPart(-1, 0),
    ArrowRight: () => moveSelectedPart(1, 0),
    Tab: cycleSelectedPart,
  };

  const action = keyActions[event.key];

  if (!action) return;

  event.preventDefault();
  action();
}

applyPartConfig();
setInitialPose();
startIdle();

if (DEBUG_MODE) {
  window.addEventListener('load', createDebugDots);
  window.addEventListener('keydown', handleDebugKeyboard);
}

window.CHARACTER_PARTS = CHARACTER_PARTS;
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
