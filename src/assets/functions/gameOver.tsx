import type { HitBoxConfig } from "../types";

export function checkGameOver(
  marioEl: HTMLImageElement | null,
  pipeEl: HTMLImageElement | null,
  marioHitBox: HitBoxConfig = {},
  pipeHitBox: HitBoxConfig = {},

): boolean {
  if (!marioEl || !pipeEl ) return false;

  const marioRect = marioEl.getBoundingClientRect();
  const pipeRect = pipeEl.getBoundingClientRect();

  const mario = {
    top: marioRect.top + (marioHitBox.top ?? 0),
    right: marioRect.right - (marioHitBox.right ?? 0),
    bottom: marioRect.bottom - (marioHitBox.bottom ?? 0),
    left: marioRect.left + (marioHitBox.left ?? 0),
  };

  const pipe = {
    top: pipeRect.top + (pipeHitBox.top ?? 0),
    right: pipeRect.right - (pipeHitBox.right ?? 0),
    bottom: pipeRect.bottom - (pipeHitBox.bottom ?? 0),
    left: pipeRect.left + (pipeHitBox.left ?? 0),
  };

  const collided =
    mario.right > pipe.left &&
    mario.left < pipe.right &&
    mario.bottom > pipe.top &&
    mario.top < pipe.bottom;

  return collided;
}
