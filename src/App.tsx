import "./App.css";
import { useEffect, useRef, useState } from "react";

import pipe from "../public/pipe.png";
import mario from "../public/mario.gif";
import marioGameOver from "../public/game-over.png";
import clouds from "../public/clouds.png";

import { Header } from "./assets/components/header";
import { Jump } from "./assets/functions/jump";

import { checkGameOver } from "./assets/functions/gameOver";
import { marioHitBox, pipeHitBox } from "./assets/utils/const";
import { applyGamePhysics } from "./assets/functions/gamePhysics";
import {
  resetAfterRestart,
  resetAfterStart,
} from "./assets/functions/gameReset";
import {
  freezeMarioAtCollision,
  freezePipeAtCurrentPosition,
} from "./assets/functions/freezeCollision";

function App() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const marioRef = useRef<HTMLImageElement | null>(null);
  const pipeRef = useRef<HTMLImageElement | null>(null);
  const countedThisPipeRef = useRef(false);
  const jumpedThisPipeRef = useRef(false);

  const [gameOver, setGameOver] = useState(false);
  const [marioImg, setMarioImg] = useState(mario);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);

  const handleStart = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();

    // Start always resets the run state
    setGameOver(false);
    setMarioImg(mario);

    resetAfterStart({
      pipeEl: pipeRef.current,
      marioEl: marioRef.current,
    });

    setShowInstructions(false);
  };

  const handleRestart = () => {
    setGameOver(false);
    setMarioImg(mario);

    resetAfterRestart({
      pipeEl: pipeRef.current,
      marioEl: marioRef.current,
    });
    setScore(0);
    countedThisPipeRef.current = false;
    jumpedThisPipeRef.current = false;
  };

  // Physics (responsive)
  useEffect(() => {
    const update = () =>
      applyGamePhysics({
        boardEl: boardRef.current,
        pipeEl: pipeRef.current,
      });

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Collision loop
  useEffect(() => {
    let rafId = 0;

    const loop = () => {
      // Only check collisions while actively playing
      if (!gameOver && !showInstructions) {
        const collided = checkGameOver(
          marioRef.current,
          pipeRef.current,
          marioHitBox,
          pipeHitBox,
        );

        if (collided) {
          setGameOver(true);
          setMarioImg(marioGameOver);

          if (boardRef.current && pipeRef.current) {
            freezePipeAtCurrentPosition({
              boardEl: boardRef.current,
              pipeEl: pipeRef.current,
            });
          }

          if (marioRef.current && pipeRef.current) {
            freezeMarioAtCollision({
              marioEl: marioRef.current,
              pipeEl: pipeRef.current,
              marioHitBox,
              pipeHitBox,
              gapPx: 2,
            });
          }

          return;
        }
      }
      const marioEl = marioRef.current;
      const pipeEl = pipeRef.current;
      const boardEl = boardRef.current;

      if (marioEl && pipeEl && boardEl) {
        const marioRect = marioEl.getBoundingClientRect();
        const pipeRect = pipeEl.getBoundingClientRect();
        const boardRect = boardEl.getBoundingClientRect();

        const isPipeNearMario =
          pipeRect.left < marioRect.right && pipeRect.right > marioRect.left;

        if (isPipeNearMario && marioEl.classList.contains("jump")) {
          jumpedThisPipeRef.current = true;
        }

        const pipePassedMario = pipeRect.right < marioRect.left;

        if (pipePassedMario && !countedThisPipeRef.current) {
          countedThisPipeRef.current = true;

          if (jumpedThisPipeRef.current) {
            setScore((prev) => prev + 1);
          }
        }

        const pipeLeftInBoardPx = pipeRect.left - boardRect.left;

        // when animation restarts, left goes back to ~boardWidth
        const respawnThreshold = boardRect.width - 5; // small tolerance
        const pipeRespawn = pipeLeftInBoardPx >= respawnThreshold;

        if (pipeRespawn) {
          countedThisPipeRef.current = false;
          jumpedThisPipeRef.current = false;
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameOver, showInstructions]);

  return (
    <>
      <Header />
      <div className="hud">
        <span>Score: {score}</span>
      </div>
      <div className="game-board" ref={boardRef}>
        <img
          src={clouds}
          alt="clouds"
          className={gameOver ? "clouds stop" : "clouds"}
        />

        <Jump
          src={marioImg}
          marioRef={marioRef}
          disabled={gameOver || showInstructions}
          className={gameOver ? "mario--game-over" : ""}
          showInstructions={showInstructions}
        />

        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-card">
              <h2>How to Play</h2>
              <ul>
                <li>
                  Press <b>Space</b> or <b>Arrow Up</b> to jump
                </li>
                <li>Avoid the pipes</li>
                <li>Try to survive as long as possible</li>
              </ul>

              <button onClick={handleStart}>Start</button>
            </div>
          </div>
        )}

        <img src={pipe} alt="pipe" className="pipe" ref={pipeRef} />

        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-card">
              <h2>Game Over</h2>
              <p>Try again?</p>
              <button onClick={handleRestart}>Restart</button>
            </div>
          </div>
        )}

        <div className="bottom" />
      </div>
    </>
  );
}

export default App;
