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
    pipeRef,

    gameOver,
    marioImg,
    showInstructions,
    score,

    handleStart,
    handleRestart,

    isTouch,
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

        {!showInstructions && (
          <div className="speed-warning">
            <p>Watch out! The pipes are moving faster!</p>
          </div>
        )}

        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-card">
              <h2>How to Play</h2>
              <ul>
                <li id="how-to-jump">
                  {isTouch ? (
                    <><b>Tap</b> the screen to jump</>
                  ) : (
                    <>
                      Press <b>Space</b> or <b>Arrow Up</b> to jump
                    </>
                  )}
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
