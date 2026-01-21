import { resetAnimation } from "../utils/utils";

type ResetAfterStartArgs = {
  pipeEl: HTMLImageElement | null;
  marioEl: HTMLImageElement | null;
};

export function resetAfterStart({ pipeEl, marioEl }: ResetAfterStartArgs) {
  // Reset pipe to its initial animation state
  if (pipeEl) {
    pipeEl.style.left = "";
    pipeEl.style.transform = "";
    pipeEl.style.animationPlayState = "running";
    resetAnimation(pipeEl); // restart keyframes from 0
  }

  // Reset mario to a clean state
  if (marioEl) {
    marioEl.classList.remove("jump");
    marioEl.style.transform = "";
    marioEl.style.animationPlayState = "running";
  }
}

type ResetAfterRestartArgs = {
  pipeEl: HTMLImageElement | null;
  marioEl: HTMLImageElement | null;
};

export function resetAfterRestart({ pipeEl, marioEl }: ResetAfterRestartArgs) {
  // reset mario visual
  if (marioEl) {
    marioEl.classList.remove("jump");
    marioEl.style.animation = "";
    marioEl.style.transform = "";
  }

  // reset pipe animation
  if (pipeEl) {
    pipeEl.style.animation = "none";
    pipeEl.style.left = "";
    pipeEl.style.transform = "";

    // Force reflow to restart animation
    void pipeEl.offsetHeight;

    pipeEl.style.animation = "";
    pipeEl.style.animationPlayState = "running";
  }
}
