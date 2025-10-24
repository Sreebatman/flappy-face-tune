import { useState } from "react";
import StartScreen from "@/components/StartScreen";
import GameCanvas from "@/components/GameCanvas";
import GameOverScreen from "@/components/GameOverScreen";

type GameState = "start" | "playing" | "gameOver";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("start");
  const [finalScore, setFinalScore] = useState(0);

  const handleStart = () => {
    setGameState("playing");
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState("gameOver");
  };

  const handleRestart = () => {
    setGameState("playing");
  };

  const handleBackToStart = () => {
    setGameState("start");
  };

  return (
    <>
      {gameState === "start" && <StartScreen onStart={handleStart} />}
      {gameState === "playing" && (
        <GameCanvas onGameOver={handleGameOver} />
      )}
      {gameState === "gameOver" && (
        <GameOverScreen
          score={finalScore}
          onRestart={handleRestart}
          onBackToStart={handleBackToStart}
        />
      )}
    </>
  );
};

export default Index;
