import { useState } from "react";
import StartScreen from "@/components/StartScreen";
import GameCanvas from "@/components/GameCanvas";
import GameOverScreen from "@/components/GameOverScreen";

type GameState = "start" | "playing" | "gameOver";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("start");
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [voiceSound, setVoiceSound] = useState<File | null>(null);
  const [finalScore, setFinalScore] = useState(0);

  const handleStart = (face: string | null, voice: File | null) => {
    setFaceImage(face);
    setVoiceSound(voice);
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
    setFaceImage(null);
    setVoiceSound(null);
  };

  return (
    <>
      {gameState === "start" && <StartScreen onStart={handleStart} />}
      {gameState === "playing" && (
        <GameCanvas
          faceImage={faceImage}
          voiceSound={voiceSound}
          onGameOver={handleGameOver}
        />
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
