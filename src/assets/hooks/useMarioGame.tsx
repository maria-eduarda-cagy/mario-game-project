import { useEffect, useMemo, useRef, useState } from "react";

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

  // Multiple pipes
  const pipeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const pipeFlagsRef = useRef<PipeFlags[]>([]);

  const [gameOver, setGameOver] = useState(false);
  const [marioImg, setMarioImg] = useState(mario);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [pipeDurationMs, setPipeDurationMs] = useState(2400);
  const [pipeGapDelayMs, setPipeGapDelayMs] = useState(1200);

  const pipeCount = useMemo(() => {
    return score > 5 ? 2 : 1;
  }, [score]);

  const ensurePipeFlags = (count: number) => {
    if (pipeFlagsRef.current.length !== count) {
      pipeFlagsRef.current = Array.from({ length: count }, (_, i) => {
        return (
          pipeFlagsRef.current[i] ?? {
            counted: false,
            jumped: false,
            prevX: null,
          }
        );
      });
    }
  };

  const resetRunFlags = (count: number) => {
    ensurePipeFlags(count);
    for (let i = 0; i < count; i++) {
      const f = pipeFlagsRef.current[i];
      if (!f) continue;
      f.counted = false;
      f.jumped = false;
      f.prevX = null;
    }
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

    // Reset all pipes
    resetRunFlags(pipeCount);
    for (let i = 0; i < pipeCount; i++) {
      resetAfterStart({
        pipeEl: pipeRefs.current[i],
        marioEl: marioRef.current,
      });
    }

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

    // Reset all pipe animations
    for (let i = 0; i < pipeRefs.current.length; i++) {
      resetAfterRestart({
        pipeEl: pipeRefs.current[i],
        marioEl: marioRef.current,
      });
    }

    // Reset all scoring flags
    resetRunFlags(pipeCount);
  };

  // Physics (responsive + difficulty)
  useEffect(() => {
    ensurePipeFlags(pipeCount);

    const update = () => {
      const result = applyGamePhysics({
        boardEl: boardRef.current,
        pipeEl: pipeRefs.current[0],
        score,
        pipeCount,
      });

      if (result?.pipeDurationMs) setPipeDurationMs(result.pipeDurationMs);
      if (result?.pipeGapDelayMs) setPipeGapDelayMs(result.pipeGapDelayMs);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [score, pipeCount]);

  // Collision + scoring loop
  useEffect(() => {
    let rafId = 0;

    const loop = () => {
      if (!gameOver && !showInstructions) {
        const marioEl = marioRef.current;
        const boardEl = boardRef.current;

        if (marioEl && boardEl) {
          const marioRect = marioEl.getBoundingClientRect();
          const boardRect = boardEl.getBoundingClientRect();

          ensurePipeFlags(pipeCount);

          // Check collisions against any pipe
          let collidedPipe: HTMLImageElement | null = null;

          for (let i = 0; i < pipeCount; i++) {
            const p = pipeRefs.current[i];
            if (!p) continue;

            if (checkGameOver(marioEl, p, marioHitBox, pipeHitBox)) {
              collidedPipe = p;
              break;
            }
          }

          if (collidedPipe) {
            setGameOver(true);
            setMarioImg(marioGameOver);

            freezePipeAtCurrentPosition({
              boardEl,
              pipeEl: collidedPipe,
            });

            freezeMarioAtCollision({
              marioEl,
              pipeEl: collidedPipe,
              marioHitBox,
              pipeHitBox,
              gapPx: 2,
            });

            return; // stop loop on game over
          }

          // Score per pipe-cycle (each pipe has its own flags)
          for (let i = 0; i < pipeCount; i++) {
            const p = pipeRefs.current[i];
            const flags = pipeFlagsRef.current[i];
            if (!p || !flags) continue;

            const pipeRect = p.getBoundingClientRect();

            const isPipeNearMario =
              pipeRect.left < marioRect.right &&
              pipeRect.right > marioRect.left;

            if (isPipeNearMario && marioEl.classList.contains("jump")) {
              flags.jumped = true;
            }

            const pipePassedMario = pipeRect.right < marioRect.left;

            if (pipePassedMario && !flags.counted) {
              flags.counted = true;
              if (flags.jumped) setScore((prev) => prev + 1);
            }

            // Detect animation wrap-around (pipe jumped forward to the start)
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
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameOver, showInstructions, pipeCount]);

  return {
    // refs
    boardRef,
    marioRef,
    pipeRefs,

    // state
    gameOver,
    marioImg,
    showInstructions,
    score,
    pipeCount,
    pipeDurationMs,
    pipeGapDelayMs,

    // actions
    handleStart,
    handleRestart,
  };
}
