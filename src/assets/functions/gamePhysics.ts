import type { ApplyGamePhysicsArgs } from "../types";
import { clamp } from "../utils/utils";

export function applyGamePhysics({ boardEl, pipeEl }: ApplyGamePhysicsArgs) {
  if (!boardEl || !pipeEl) return;

  const boardRect = boardEl.getBoundingClientRect();
  const pipeRect = pipeEl.getBoundingClientRect();

  // Keep a constant speed (px/s) regardless of screen size
  const pipeSpeedPxPerSec = 420;

  const distancePx = boardRect.width + pipeRect.width + 80;
  const pipeDurationMs = (distancePx / pipeSpeedPxPerSec) * 1000;

  const jumpDurationMs = clamp(pipeDurationMs * 0.38, 650, 950);

  boardEl.style.setProperty(
    "--pipe-duration",
    `${pipeDurationMs.toFixed(0)}ms`,
  );
  boardEl.style.setProperty(
    "--jump-duration",
    `${jumpDurationMs.toFixed(0)}ms`,
  );
}
