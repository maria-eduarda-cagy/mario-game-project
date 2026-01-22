import type { ApplyGamePhysicsArgs } from "../types";
import { clamp } from "../utils/utils";

export function applyGamePhysics({
  boardEl,
  pipeEl,
  score,
  pipeCount,
}: ApplyGamePhysicsArgs) {
  if (!boardEl || !pipeEl) return { pipeDurationMs: 2400, pipeGapDelayMs: 1200 };

  const boardRect = boardEl.getBoundingClientRect();
  const pipeRect = pipeEl.getBoundingClientRect();

  const baseSpeed = 420;

  // Speed only increases every `pipeCount` points
  const difficultyStep = pipeCount != 1 ? 6:(Math.floor(score / Math.max(1, pipeCount)))

  // px/s per step (tweak this value)
  const speed = clamp(baseSpeed + difficultyStep * 18, 420, 650);

  const distancePx = boardRect.width + pipeRect.width + 80;
  const pipeDurationMs = (distancePx / speed) * 1000;

  const jumpDurationMs = clamp(pipeDurationMs * 0.38, 600, 900);

  // Keep a fixed spacing in PX, converted to MS by current speed
  const gapPx = clamp(boardRect.width * 0.55, 260, 520);
  const pipeGapDelayMs = (gapPx / speed) * 1000;

  boardEl.style.setProperty("--pipe-duration", `${pipeDurationMs.toFixed(0)}ms`);
  boardEl.style.setProperty("--jump-duration", `${jumpDurationMs.toFixed(0)}ms`);

  return { pipeDurationMs, pipeGapDelayMs };
}
