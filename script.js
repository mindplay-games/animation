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
  gsap.set(robot, { scale: 1, y: 0, rotate: -7 });
  gsap.set(head, { x: 0, y: 0, rotate: -3 });
  gsap.set(body, { x: 0, y: 0, rotate: -2, scaleY: 1 });
  gsap.set(leftHand, { x: 0, y: 0, rotate: -14 });
  gsap.set(rightHand, { x: 0, y: 0, rotate: -6 });
  gsap.set(leftLeg, { x: 0, y: 0, rotate: 19 });
  gsap.set(rightLeg, { x: 0, y: 0, rotate: -18 });
}

function buildIdleTimeline() {
  const timeline = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

  timeline
    .to(robot, { y: -8, duration: 1.45 }, 0)
    .to(robot, { y: 0, duration: 1.45 }, 1.45)
    .to(body, { scaleY: 1.025, y: -3, duration: 1.45 }, 0)
    .to(body, { scaleY: 1, y: 0, duration: 1.45 }, 1.45)
    .to(head, { rotate: 1.5, y: -4, duration: 1.45 }, 0)
    .to(head, { rotate: -3, y: 0, duration: 1.45 }, 1.45)
    .to(leftHand, { rotate: -9, y: -3, duration: 1.45 }, 0)
    .to(leftHand, { rotate: -14, y: 0, duration: 1.45 }, 1.45)
    .to(rightHand, { rotate: 4, y: -4, duration: 1.45 }, 0)
    .to(rightHand, { rotate: -6, y: 0, duration: 1.45 }, 1.45)
    .to(leftLeg, { rotate: 15, x: -2, duration: 1.45 }, 0)
    .to(leftLeg, { rotate: 19, x: 0, duration: 1.45 }, 1.45)
    .to(rightLeg, { rotate: -13, x: 2, duration: 1.45 }, 0)
    .to(rightLeg, { rotate: -18, x: 0, duration: 1.45 }, 1.45);

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
    .to(rightHand, { rotate: -18, y: -8, duration: 0.18 })
    .to(rightHand, { rotate: 18, duration: 0.2, repeat: 5, yoyo: true })
    .to(rightHand, { rotate: -6, y: 0, duration: 0.28 });
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
