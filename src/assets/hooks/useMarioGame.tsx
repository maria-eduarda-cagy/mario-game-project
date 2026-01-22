import { useEffect, useRef, useState } from "react";

import mario from "../../../public/mario.gif";
import marioGameOver from "../../../public/game-over.png";

import { checkGameOver } from "../functions/gameOver";
import { applyGamePhysics } from "../functions/gamePhysics";
import { resetAfterRestart, resetAfterStart } from "../functions/gameReset";
import {
  freezeMarioAtCollision,
  freezePipeAtCurrentPosition,
} from "../functions/freezeCollision";
import { marioHitBox, pipeHitBox } from "../utils/const";
import type { PipeFlags } from "../types";

export function useMarioGame() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const marioRef = useRef<HTMLImageElement | null>(null);

  // Single pipe
  const pipeRef = useRef<HTMLImageElement | null>(null);

  // Single pipe flags
  const pipeFlagsRef = useRef<PipeFlags>({
    counted: false,
    jumped: false,
    prevX: null,
  });

  const [gameOver, setGameOver] = useState(false);
  const [marioImg, setMarioImg] = useState(mario);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [pipeDurationMs, setPipeDurationMs] = useState(2400);
  const [pipeGapDelayMs, setPipeGapDelayMs] = useState(1200);

  const isTouch =
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const resetRunFlags = () => {
    const f = pipeFlagsRef.current;
    f.counted = false;
    f.jumped = false;
    f.prevX = null;
  }; 

  const handleStart = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();

    setGameOver(false);
    setMarioImg(mario);

    // Reset mario visual state
    if (marioRef.current) {
      marioRef.current.classList.remove("jump");
      marioRef.current.style.transform = "";
      marioRef.current.style.animationPlayState = "running";
    }

    // Reset pipe
    resetRunFlags();
    resetAfterStart({
      pipeEl: pipeRef.current,
      marioEl: marioRef.current,
    });

    setShowInstructions(false);
  };

  const handleRestart = () => {
    setScore(0);
    setShowInstructions(true);

    setGameOver(false);
    setMarioImg(mario);

    if (marioRef.current) {
      marioRef.current.classList.remove("jump");
      marioRef.current.style.animation = "";
      marioRef.current.style.transform = "";
    }

    // Reset pipe animation
    resetAfterRestart({
      pipeEl: pipeRef.current,
      marioEl: marioRef.current,
    });

    // Reset scoring flags
    resetRunFlags();
  };

  // Recalculate physics based on current score and board size (bug fix)
  useEffect(() => {
    const boardEl = boardRef.current;
    const pipeEl = pipeRef.current;
    if (!boardEl || !pipeEl) return;

    const apply = () => {
      applyGamePhysics({ boardEl, pipeEl, score });
    };

    apply();
    // Reapply physics only when the pipe animation restarts
    const onIter = () => apply();
    pipeEl.addEventListener("animationiteration", onIter);

    // Recalculate on resize so speed stays consistent with board width
    const onResize = () => apply();
    window.addEventListener("resize", onResize);

    return () => {
      pipeEl.removeEventListener("animationiteration", onIter);
      window.removeEventListener("resize", onResize);
    };
  }, [score]);

  // Physics (responsive + difficulty)
  useEffect(() => {
    const update = () => {
      const result = applyGamePhysics({
        boardEl: boardRef.current,
        pipeEl: pipeRef.current,
        score,
      });

      if (result?.pipeDurationMs) setPipeDurationMs(result.pipeDurationMs);
      if (result?.pipeGapDelayMs) setPipeGapDelayMs(result.pipeGapDelayMs);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [score]);

  // Collision + scoring loop
  useEffect(() => {
    let rafId = 0;

    const loop = () => {
      if (!gameOver && !showInstructions) {
        const marioEl = marioRef.current;
        const boardEl = boardRef.current;
        const pipeEl = pipeRef.current;

        if (marioEl && boardEl && pipeEl) {
          const marioRect = marioEl.getBoundingClientRect();
          const boardRect = boardEl.getBoundingClientRect();

          // Collision
          if (checkGameOver(marioEl, pipeEl, marioHitBox, pipeHitBox)) {
            setGameOver(true);
            setMarioImg(marioGameOver);

            freezePipeAtCurrentPosition({
              boardEl,
              pipeEl,
            });

            freezeMarioAtCollision({
              marioEl,
              pipeEl,
              marioHitBox,
              pipeHitBox,
              gapPx: 2,
            });

            return; // stop loop on game over
          }

          // Score per pipe-cycle (single flags)
          const flags = pipeFlagsRef.current;
          const pipeRect = pipeEl.getBoundingClientRect();

          const isPipeNearMario =
            pipeRect.left < marioRect.right && pipeRect.right > marioRect.left;

          if (isPipeNearMario && marioEl.classList.contains("jump")) {
            flags.jumped = true;
          }

          const pipePassedMario = pipeRect.right < marioRect.left;

          if (pipePassedMario && !flags.counted) {
            flags.counted = true;
            if (flags.jumped) setScore((prev) => prev + 1);
          }

          // Detect animation wrap-around
          const x = pipeRect.left - boardRect.left;

          if (flags.prevX !== null) {
            const jumpedForward = x - flags.prevX > boardRect.width * 0.6;
            if (jumpedForward) {
              flags.counted = false;
              flags.jumped = false;
            }
          }

          flags.prevX = x;
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameOver, showInstructions]);

  return {
    // refs
    boardRef,
    marioRef,
    pipeRef,

    // state
    gameOver,
    marioImg,
    showInstructions,
    score,
    pipeDurationMs,
    pipeGapDelayMs,

    // actions
    handleStart,
    handleRestart,
    isTouch
  };
}
