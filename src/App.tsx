import "./App.css";

import pipe from "../public/pipe.png";
import clouds from "../public/clouds.png";

import { Header } from "./assets/components/header";
import { Jump } from "./assets/functions/jump";
import { useMarioGame } from "./assets/hooks/useMarioGame";

function App() {
  const {
    boardRef,
    marioRef,
    pipeRefs,

    gameOver,
    marioImg,
    showInstructions,
    score,
    pipeCount,
    pipeGapDelayMs,

    handleStart,
    handleRestart,
  } = useMarioGame();

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

        {score > 5 && !showInstructions && !gameOver && (
          <div className="speed-warning">
            <p>Watch out! The pipes are moving faster!</p>
          </div>
        )}

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

        {Array.from({ length: pipeCount }).map((_, i) => (
          <img
            key={`pipe-${i}`}
            src={pipe}
            alt="pipe"
            className={`pipe pipe-${i}`}
            ref={(el) => {
              pipeRefs.current[i] = el;
            }}
            style={{
              animationPlayState: gameOver ? "paused" : "running",
              // Use negative delay so pipes are spaced immediately
              animationDelay: `-${Math.floor(i * pipeGapDelayMs)}ms`,
            }}
          />
        ))}

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
