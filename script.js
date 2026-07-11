const DEBUG_ROBOT = false;

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

const PART_NAMES = [
  'robot',
  'head',
  'body',
  'leftHand',
  'rightHand',
  'leftLeg',
  'rightLeg',
];

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
let idleTimeline = null;
let talkTimeline = null;
let actionTimeline = null;
let debugPanel = null;

/* -------------------------------------------------------
   CONFIG HELPERS
------------------------------------------------------- */

function base(partName) {
  return ROBOT_CONFIG[partName];
}

function splitTransformOrigin(transformOrigin) {
  const [x = '50%', y = '50%'] = transformOrigin.split(' ');

  return {
    x: parseFloat(x),
    y: parseFloat(y),
  };
}

function joinTransformOrigin(x, y) {
  return `${x}% ${y}%`;
}

function getDebugValue(partName, field) {
  const config = ROBOT_CONFIG[partName];

  if (field === 'transformOriginX') {
    return splitTransformOrigin(config.transformOrigin).x;
  }

  if (field === 'transformOriginY') {
    return splitTransformOrigin(config.transformOrigin).y;
  }

  return config[field] ?? 0;
}

function setDebugValue(partName, field, value) {
  const config = ROBOT_CONFIG[partName];
  const numericValue = Number(value);

  if (
    field === 'transformOriginX' ||
    field === 'transformOriginY'
  ) {
    const origin = splitTransformOrigin(config.transformOrigin);

    if (field === 'transformOriginX') {
      origin.x = numericValue;
    }

    if (field === 'transformOriginY') {
      origin.y = numericValue;
    }

    config.transformOrigin = joinTransformOrigin(
      origin.x,
      origin.y
    );

    return;
  }

  config[field] = numericValue;
}

/* -------------------------------------------------------
   APPLY BASE CONFIG
------------------------------------------------------- */

function applyConfigToPart(partName) {
  const element = partElements[partName];
  const config = ROBOT_CONFIG[partName];

  if (!element) return;

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
  }

  gsap.set(element, styles);
}

function applyRobotConfig() {
  PART_NAMES.forEach(applyConfigToPart);
  updateOriginDots();
  updateSelectedHighlight();
}

/**
 * מחזיר את הדמות בעדינות לתנוחת הבסיס.
 */
function returnToBasePose(duration = 0.3) {
  const timelines = [
    {
      element: robot,
      config: base('robot'),
    },
    {
      element: partElements.head,
      config: base('head'),
    },
    {
      element: partElements.body,
      config: base('body'),
    },
    {
      element: partElements.leftHand,
      config: base('leftHand'),
    },
    {
      element: partElements.rightHand,
      config: base('rightHand'),
    },
    {
      element: partElements.leftLeg,
      config: base('leftLeg'),
    },
    {
      element: partElements.rightLeg,
      config: base('rightLeg'),
    },
  ];

  timelines.forEach(({ element, config }) => {
    gsap.to(element, {
      x: config.x,
      y: config.y,
      rotate: config.rotate,
      scale: config.scale,
      scaleX: config.scaleX,
      scaleY: config.scaleY,
      duration,
      ease: 'sine.out',
      overwrite: 'auto',
    });
  });
}

/* -------------------------------------------------------
   IDLE ANIMATION
------------------------------------------------------- */

function buildIdleTimeline() {
  const timeline = gsap.timeline({
    repeat: -1,
    defaults: {
      ease: 'sine.inOut',
      overwrite: 'auto',
    },
  });

  /*
   * מחזור מלא: 3.6 שניות.
   * הגוף מוביל, הראש והגפיים מגיבים בעדינות.
   */

  timeline
    // כל הדמות עולה מעט
    .to(
      robot,
      {
        y: base('robot').y - 4,
        duration: 1.8,
      },
      0
    )

    // הגוף "נושם"
    .to(
      partElements.body,
      {
        y: base('body').y - 2,
        scaleX: base('body').scaleX * 0.995,
        scaleY: base('body').scaleY * 1.012,
        duration: 1.8,
      },
      0
    )

    // הראש מגיב מעט באיחור
    .to(
      partElements.head,
      {
        y: base('head').y - 2,
        rotate: base('head').rotate + 1.5,
        duration: 1.65,
      },
      0.15
    )

    // תנועה קטנה ביד שמאל
    .to(
      partElements.leftHand,
      {
        y: base('leftHand').y - 1.5,
        rotate: base('leftHand').rotate + 2,
        duration: 1.8,
      },
      0.05
    )

    // תנועה מעט שונה ביד ימין
    .to(
      partElements.rightHand,
      {
        y: base('rightHand').y - 2,
        rotate: base('rightHand').rotate + 2.5,
        duration: 1.75,
      },
      0.15
    )

    // הרגליים כמעט לא זזות
    .to(
      partElements.leftLeg,
      {
        x: base('leftLeg').x - 0.8,
        rotate: base('leftLeg').rotate - 1,
        duration: 1.8,
      },
      0
    )

    .to(
      partElements.rightLeg,
      {
        x: base('rightLeg').x + 0.8,
        rotate: base('rightLeg').rotate + 1,
        duration: 1.8,
      },
      0.1
    )

    // חוזרים לבסיס
    .to(
      robot,
      {
        y: base('robot').y,
        duration: 1.8,
      },
      1.8
    )

    .to(
      partElements.body,
      {
        y: base('body').y,
        scaleX: base('body').scaleX,
        scaleY: base('body').scaleY,
        duration: 1.8,
      },
      1.8
    )

    .to(
      partElements.head,
      {
        y: base('head').y,
        rotate: base('head').rotate,
        duration: 1.65,
      },
      1.95
    )

    .to(
      partElements.leftHand,
      {
        y: base('leftHand').y,
        rotate: base('leftHand').rotate,
        duration: 1.8,
      },
      1.85
    )

    .to(
      partElements.rightHand,
      {
        y: base('rightHand').y,
        rotate: base('rightHand').rotate,
        duration: 1.75,
      },
      1.95
    )

    .to(
      partElements.leftLeg,
      {
        x: base('leftLeg').x,
        rotate: base('leftLeg').rotate,
        duration: 1.8,
      },
      1.8
    )

    .to(
      partElements.rightLeg,
      {
        x: base('rightLeg').x,
        rotate: base('rightLeg').rotate,
        duration: 1.8,
      },
      1.9
    );

  return timeline;
}

function startIdle() {
  talkStop(false);
  stopActionAnimation();

  if (!idleTimeline) {
    idleTimeline = buildIdleTimeline();
  }

  idleTimeline.play();
}

function stopIdle(returnToPose = true) {
  if (!idleTimeline) return;

  idleTimeline.pause();

  if (returnToPose) {
    returnToBasePose();
  }
}

/* -------------------------------------------------------
   WAVE ANIMATION
------------------------------------------------------- */

function stopActionAnimation() {
  if (!actionTimeline) return;

  actionTimeline.kill();
  actionTimeline = null;
}

function wave() {
  const shouldResumeIdle =
    idleTimeline &&
    !idleTimeline.paused();

  idleTimeline?.pause();
  talkStop(false);
  stopActionAnimation();

  const hand = partElements.rightHand;
  const handBase = base('rightHand');

  actionTimeline = gsap.timeline({
    defaults: {
      ease: 'sine.inOut',
      overwrite: 'auto',
    },

    onComplete: () => {
      actionTimeline = null;

      if (shouldResumeIdle) {
        returnToBasePose(0.2);

        gsap.delayedCall(0.2, () => {
          idleTimeline?.restart();
        });
      }
    },
  });

  actionTimeline
    // מרימים את היד בעדינות
    .to(hand, {
      y: handBase.y - 5,
      rotate: handBase.rotate - 8,
      duration: 0.28,
      ease: 'sine.out',
    })

    // נפנוף
    .to(hand, {
      rotate: handBase.rotate + 10,
      duration: 0.22,
      repeat: 4,
      yoyo: true,
      ease: 'sine.inOut',
    })

    // חזרה לתנוחת הבסיס
    .to(hand, {
      x: handBase.x,
      y: handBase.y,
      rotate: handBase.rotate,
      duration: 0.35,
      ease: 'sine.out',
    });

  return actionTimeline;
}

/* -------------------------------------------------------
   TALK ANIMATION
------------------------------------------------------- */

function buildTalkTimeline() {
  const timeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.06,
    defaults: {
      ease: 'sine.inOut',
      overwrite: 'auto',
    },
  });

  timeline
    // הנהון קטן
    .to(
      partElements.head,
      {
        y: base('head').y - 1.5,
        rotate: base('head').rotate + 1,
        duration: 0.22,
      },
      0
    )

    // הגוף מגיב מעט
    .to(
      partElements.body,
      {
        y: base('body').y - 0.8,
        duration: 0.22,
      },
      0.02
    )

    // יד אחת מגיבה טיפה
    .to(
      partElements.leftHand,
      {
        rotate: base('leftHand').rotate + 1.2,
        duration: 0.22,
      },
      0.04
    )

    // חזרה
    .to(
      partElements.head,
      {
        y: base('head').y,
        rotate: base('head').rotate,
        duration: 0.24,
      },
      0.22
    )

    .to(
      partElements.body,
      {
        y: base('body').y,
        duration: 0.24,
      },
      0.24
    )

    .to(
      partElements.leftHand,
      {
        rotate: base('leftHand').rotate,
        duration: 0.24,
      },
      0.26
    );

  return timeline;
}

function talkStart() {
  idleTimeline?.pause();
  stopActionAnimation();

  if (talkTimeline) {
    talkTimeline.kill();
  }

  talkTimeline = buildTalkTimeline();
  talkTimeline.play();
}

function talkStop(returnToPose = true) {
  if (!talkTimeline) return;

  talkTimeline.kill();
  talkTimeline = null;

  if (returnToPose) {
    returnToBasePose(0.25);
  }
}

/* -------------------------------------------------------
   GLOBAL ANIMATION CONTROLS
------------------------------------------------------- */

function pauseAnimations() {
  idleTimeline?.pause();
  talkTimeline?.pause();
  actionTimeline?.pause();

  gsap
    .getTweensOf(Object.values(partElements))
    .forEach((tween) => tween.pause());
}

function resumeAnimations() {
  if (talkTimeline) {
    talkTimeline.resume();
    return;
  }

  if (actionTimeline) {
    actionTimeline.resume();
    return;
  }

  if (idleTimeline) {
    idleTimeline.resume();
  }
}

/* -------------------------------------------------------
   DEBUG PANEL
------------------------------------------------------- */

function createDebugPanel() {
  debugPanel = document.createElement('aside');
  debugPanel.className = 'debug-panel';

  debugPanel.innerHTML = `
    <h2>Robot Debug Editor</h2>

    <label>
      Part
      <select data-debug-part>
        ${PART_NAMES.map(
          (partName) =>
            `<option value="${partName}">${partName}</option>`
        ).join('')}
      </select>
    </label>

    <div class="debug-fields"></div>

    <div class="debug-actions">
      <button type="button" data-debug-action="pause">
        Pause animations
      </button>

      <button type="button" data-debug-action="resume">
        Resume animations
      </button>

      <button type="button" data-debug-action="reset">
        Reset selected part
      </button>

      <button type="button" data-debug-action="copy">
        Copy current config
      </button>
    </div>

    <p class="debug-help">
      Shortcuts: arrows move 1px,
      Shift+arrows move 10px,
      [ / ] rotate 1°,
      Shift+[ / Shift+] rotate 5°,
      Tab cycles parts.
    </p>
  `;

  document.body.appendChild(debugPanel);

  const select =
    debugPanel.querySelector('[data-debug-part]');

  select.value = selectedPart;

  select.addEventListener('change', () => {
    selectPart(select.value);
  });

  debugPanel.addEventListener('input', (event) => {
    const input = event.target.closest(
      '[data-debug-field]'
    );

    if (!input) return;

    setDebugValue(
      selectedPart,
      input.dataset.debugField,
      input.value
    );

    applyConfigToPart(selectedPart);
    updateOriginDots();
    updateSelectedHighlight();
  });

  debugPanel.addEventListener('click', (event) => {
    const button = event.target.closest(
      '[data-debug-action]'
    );

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
  if (!debugPanel) return;

  const fields =
    debugPanel.querySelector('.debug-fields');

  fields.innerHTML = '';
  debugInputs.clear();

  CONFIG_FIELDS.forEach((field) => {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'number';

    input.step =
      field.includes('transformOrigin') ||
      field.includes('scale')
        ? '0.01'
        : '1';

    input.value = getDebugValue(
      selectedPart,
      field
    );

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

    if (input) {
      input.value = getDebugValue(
        selectedPart,
        field
      );
    }
  });
}

function selectPart(partName) {
  selectedPart = partName;

  const select = debugPanel?.querySelector(
    '[data-debug-part]'
  );

  if (select) {
    select.value = selectedPart;
  }

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
  const { x, y } = splitTransformOrigin(
    config.transformOrigin
  );

  if (partName === 'robot') {
    return {
      left:
        (config.width || robot.offsetWidth) *
        (x / 100),

      top:
        robot.offsetHeight *
        (y / 100),
    };
  }

  const element = partElements[partName];

  return {
    left:
      config.left +
      config.width * (x / 100),

    top:
      config.top +
      element.offsetHeight * (y / 100),
  };
}

function updateOriginDots() {
  if (
    !DEBUG_ROBOT ||
    originDots.size === 0
  ) {
    return;
  }

  PART_NAMES.forEach((partName) => {
    const dot = originDots.get(partName);
    const position =
      getOriginDotPosition(partName);

    dot.style.left = `${position.left}px`;
    dot.style.top = `${position.top}px`;

    dot.classList.toggle(
      'is-selected',
      partName === selectedPart
    );
  });
}

function updateSelectedHighlight() {
  if (!DEBUG_ROBOT) return;

  PART_NAMES.forEach((partName) => {
    partElements[partName]?.classList.toggle(
      'debug-selected',
      partName === selectedPart
    );
  });
}

function resetSelectedPart() {
  ROBOT_CONFIG[selectedPart] =
    structuredClone(
      initialConfig[selectedPart]
    );

  applyConfigToPart(selectedPart);
  refreshDebugInputs();
  updateOriginDots();
  updateSelectedHighlight();
}

function formatConfigForCopy() {
  return `const ROBOT_CONFIG = ${JSON.stringify(
    ROBOT_CONFIG,
    null,
    2
  ).replace(/"([^"\\]+)":/g, '$1:')};`;
}

async function copyCurrentConfig() {
  const output = formatConfigForCopy();

  console.log(output);

  try {
    await navigator.clipboard.writeText(output);
  } catch (error) {
    console.warn(
      'Clipboard copy failed. Config was logged to the console instead.',
      error
    );
  }
}

function moveSelectedPart(deltaX, deltaY) {
  ROBOT_CONFIG[selectedPart].x += deltaX;
  ROBOT_CONFIG[selectedPart].y += deltaY;

  applyConfigToPart(selectedPart);
  refreshDebugInputs();
  updateOriginDots();
}

function rotateSelectedPart(delta) {
  ROBOT_CONFIG[selectedPart].rotate += delta;

  applyConfigToPart(selectedPart);
  refreshDebugInputs();
  updateOriginDots();
}

function handleDebugKeyboard(event) {
  if (!DEBUG_ROBOT) return;

  const activeTag =
    document.activeElement?.tagName;

  const isTyping = [
    'INPUT',
    'SELECT',
    'TEXTAREA',
  ].includes(activeTag);

  if (
    isTyping &&
    event.key !== 'Tab'
  ) {
    return;
  }

  const moveAmount =
    event.shiftKey ? 10 : 1;

  const rotateAmount =
    event.shiftKey ? 5 : 1;

  const actions = {
    ArrowUp: () =>
      moveSelectedPart(0, -moveAmount),

    ArrowDown: () =>
      moveSelectedPart(0, moveAmount),

    ArrowLeft: () =>
      moveSelectedPart(-moveAmount, 0),

    ArrowRight: () =>
      moveSelectedPart(moveAmount, 0),

    '[': () =>
      rotateSelectedPart(-rotateAmount),

    ']': () =>
      rotateSelectedPart(rotateAmount),

    Tab: () => {
      const currentIndex =
        PART_NAMES.indexOf(selectedPart);

      const nextIndex =
        (currentIndex + 1) %
        PART_NAMES.length;

      selectPart(PART_NAMES[nextIndex]);
    },
  };

  const action = actions[event.key];

  if (!action) return;

  event.preventDefault();
  action();
}

/* -------------------------------------------------------
   INITIALIZATION
------------------------------------------------------- */

applyRobotConfig();

if (DEBUG_ROBOT) {
  createDebugPanel();
  createOriginDots();

  window.addEventListener(
    'load',
    updateOriginDots
  );

  window.addEventListener(
    'keydown',
    handleDebugKeyboard
  );

  pauseAnimations();
} else {
  startIdle();
}

/* -------------------------------------------------------
   PUBLIC API
------------------------------------------------------- */

window.ROBOT_CONFIG = ROBOT_CONFIG;

window.startIdle = startIdle;
window.stopIdle = stopIdle;
window.wave = wave;
window.talkStart = talkStart;
window.talkStop = talkStop;

/* -------------------------------------------------------
   CONTROL BUTTONS
------------------------------------------------------- */

if (controls) {
  controls.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest(
        'button[data-action]'
      );

      if (!button) return;

      const actions = {
        idle: startIdle,
        stop: () => {
          stopIdle();
          talkStop();
          stopActionAnimation();
        },
        wave,
        talk: talkStart,
        'talk-stop': () => {
          talkStop();
          startIdle();
        },
      };

      actions[button.dataset.action]?.();
    }
  );
}
