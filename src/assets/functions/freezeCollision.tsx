import type { CollisionSide, HitBoxConfig } from "../types";

function applyHitBox(rect: DOMRect, hb: HitBoxConfig) {
  return {
    top: rect.top + (hb.top ?? 0),
    right: rect.right - (hb.right ?? 0),
    bottom: rect.bottom - (hb.bottom ?? 0),
    left: rect.left + (hb.left ?? 0),
  };
}

function getTranslate(el: HTMLElement) {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none") return { x: 0, y: 0 };

  // matrix(a,b,c,d,tx,ty)
  const m = new DOMMatrixReadOnly(t);
  return { x: m.m41, y: m.m42 };
}

function setTranslate(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

function getCollisionSide(
  mario: ReturnType<typeof applyHitBox>,
  pipe: ReturnType<typeof applyHitBox>,
): CollisionSide {
  // Overlaps from each direction (px)
  const fromTop = mario.bottom - pipe.top; // mario coming down onto pipe
  const fromBottom = pipe.bottom - mario.top; // mario coming up into pipe
  const fromLeft = mario.right - pipe.left; // mario hits pipe front
  const fromRight = pipe.right - mario.left; // pipe hits mario from behind

  const minOverlap = Math.min(fromTop, fromBottom, fromLeft, fromRight);

  if (minOverlap === fromTop) return "TOP";
  if (minOverlap === fromBottom) return "BOTTOM";
  if (minOverlap === fromLeft) return "LEFT";
  return "RIGHT";
}

export function freezeMarioAtCollision(args: {
  marioEl: HTMLImageElement;
  pipeEl: HTMLImageElement;
  marioHitBox?: HitBoxConfig;
  pipeHitBox?: HitBoxConfig;
  gapPx?: number;
}) {
  const {
    marioEl,
    pipeEl,
    marioHitBox = {},
    pipeHitBox = {},
    gapPx = 2,
  } = args;

  const marioRect = marioEl.getBoundingClientRect();
  const pipeRect = pipeEl.getBoundingClientRect();

  const mario = applyHitBox(marioRect, marioHitBox);
  const pipe = applyHitBox(pipeRect, pipeHitBox);

  const collided =
    mario.right > pipe.left &&
    mario.left < pipe.right &&
    mario.bottom > pipe.top &&
    mario.top < pipe.bottom;
  const { x: curX, y: curY } = getTranslate(marioEl);

  if (!collided) return { collided: false as const };

  const side = getCollisionSide(mario, pipe);

  pipeEl.style.animationPlayState = "paused";
  marioEl.style.animationPlayState = "paused";

  marioEl.classList.remove("jump");
  marioEl.style.animation = "none";

  let dx = 0;
  let dy = 0;

  if (side === "TOP") {
    const desiredBottom = pipe.top - gapPx;
    const currentBottom = mario.bottom;
    dy = desiredBottom - currentBottom;
    console.log("TOP collision adjustment:", {
      desiredBottom,
      currentBottom,
      dy,
    });
  } else if (side === "BOTTOM") {
    const desiredTop = pipe.bottom + gapPx;
    const currentTop = mario.top;
    dy = desiredTop - currentTop;
  } else if (side === "LEFT") {
    const desiredRight = pipe.left - gapPx;
    const currentRight = mario.right;
    dx = desiredRight - currentRight;
  } else if (side === "RIGHT") {
    const desiredLeft = pipe.right + gapPx;
    const currentLeft = mario.left;
    dx = desiredLeft - currentLeft;
  }

  setTranslate(marioEl, curX + dx, curY + dy);

  return { collided: true as const, side };
}

export function freezePipeAtCurrentPosition(args: {
  boardEl: HTMLElement;
  pipeEl: HTMLImageElement;
}) {
  const { boardEl, pipeEl } = args;

  const boardRect = boardEl.getBoundingClientRect();
  const pipeRect = pipeEl.getBoundingClientRect();

  const leftPx = pipeRect.left - boardRect.left;

  pipeEl.style.animation = "none";
  pipeEl.style.animationPlayState = "paused";
  pipeEl.style.left = `${leftPx}px`;
}
