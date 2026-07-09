const robot = document.querySelector('.robot');
const head = document.querySelector('.head');
const body = document.querySelector('.body');
const leftHand = document.querySelector('.left-hand');
const rightHand = document.querySelector('.right-hand');
const leftLeg = document.querySelector('.left-leg');
const rightLeg = document.querySelector('.right-leg');

let idleTimeline;
let talkTimeline;

function setInitialPose() {
  gsap.set(robot, { scale: 1, y: 0, rotate: 0 });
  gsap.set(head, { x: 0, y: 0, rotate: -2 });
  gsap.set(body, { x: 0, y: 0, rotate: 0, scaleY: 1 });
  gsap.set(leftHand, { x: 0, y: 0, rotate: -8 });
  gsap.set(rightHand, { x: 0, y: 0, rotate: -5 });
  gsap.set(leftLeg, { x: 0, y: 0, rotate: 3 });
  gsap.set(rightLeg, { x: 0, y: 0, rotate: -4 });
}

function buildIdleTimeline() {
  const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

  timeline
    .to(robot, { y: -8, duration: 1.45 }, 0)
    .to(robot, { y: 0, duration: 1.45 }, 1.45)
    .to(body, { scaleY: 1.025, y: -3, duration: 1.45 }, 0)
    .to(body, { scaleY: 1, y: 0, duration: 1.45 }, 1.45)
    .to(head, { rotate: 2.5, y: -5, duration: 1.45 }, 0)
    .to(head, { rotate: -2, y: 0, duration: 1.45 }, 1.45)
    .to(leftHand, { rotate: -2, y: -4, duration: 1.45 }, 0)
    .to(leftHand, { rotate: -8, y: 0, duration: 1.45 }, 1.45)
    .to(rightHand, { rotate: 1, y: -5, duration: 1.45 }, 0)
    .to(rightHand, { rotate: -5, y: 0, duration: 1.45 }, 1.45)
    .to(leftLeg, { rotate: -1.5, x: -2, duration: 1.45 }, 0)
    .to(leftLeg, { rotate: 3, x: 0, duration: 1.45 }, 1.45)
    .to(rightLeg, { rotate: 1.5, x: 2, duration: 1.45 }, 0)
    .to(rightLeg, { rotate: -4, x: 0, duration: 1.45 }, 1.45);

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
    .to(rightHand, { rotate: -28, y: -8, duration: 0.18 })
    .to(rightHand, { rotate: 22, duration: 0.22, repeat: 5, yoyo: true })
    .to(rightHand, { rotate: -5, y: 0, duration: 0.28 });
}

function talkStart() {
  if (talkTimeline) {
    talkTimeline.kill();
  }

  talkTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })
    .to(head, { y: -3, scaleY: 0.985, duration: 0.12 })
    .to(head, { y: 0, scaleY: 1, duration: 0.12 })
    .to(head, { rotate: '+=1.5', duration: 0.1 })
    .to(head, { rotate: '-=1.5', duration: 0.1 });
}

function talkStop() {
  if (talkTimeline) {
    talkTimeline.kill();
    talkTimeline = null;
    gsap.to(head, { scaleY: 1, y: 0, duration: 0.2, ease: 'sine.out' });
  }
}

setInitialPose();
startIdle();

window.startIdle = startIdle;
window.stopIdle = stopIdle;
window.wave = wave;
window.talkStart = talkStart;
window.talkStop = talkStop;

document.querySelector('.controls').addEventListener('click', (event) => {
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
