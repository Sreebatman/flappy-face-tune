import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import suraFaceDefault from "@/assets/sura-face.jpg";

interface GameCanvasProps {
  faceImage: string | null;
  voiceSound: File | null;
  onGameOver: (score: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

const GRAVITY = 0.5;
const FLAP_STRENGTH = -10;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const PLAYER_SIZE = 60;

const GameCanvas = ({ faceImage, voiceSound, onGameOver }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameStateRef = useRef({
    playerY: 300,
    playerVelocity: 0,
    pipes: [] as Pipe[],
    frameCount: 0,
    isGameOver: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Load voice sound if provided
    if (voiceSound) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (audioContextRef.current) {
          try {
            audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
          } catch (error) {
            console.error("Error decoding audio:", error);
          }
        }
      };
      reader.readAsArrayBuffer(voiceSound);
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, [voiceSound]);

  const playFlapSound = useCallback((isGoingUp: boolean) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    
    // Adjust playback rate based on direction
    source.playbackRate.value = isGoingUp ? 1.3 : 0.8;
    
    source.connect(audioContextRef.current.destination);
    source.start(0);
  }, []);

  const flap = useCallback(() => {
    if (gameStateRef.current.isGameOver) return;
    
    const isGoingUp = gameStateRef.current.playerVelocity > -5;
    gameStateRef.current.playerVelocity = FLAP_STRENGTH;
    playFlapSound(isGoingUp);
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }, [isPlaying, playFlapSound]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flap();
      }
    };

    const handleClick = () => {
      flap();
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    const gameState = gameStateRef.current;
    let animationFrameId: number;

    // Load face image (use uploaded or default Sura face)
    const faceImg = new Image();
    faceImg.src = faceImage || suraFaceDefault;

    const gameLoop = () => {
      if (gameState.isGameOver) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#bae6fd");
      gradient.addColorStop(1, "#7dd3fc");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Update player physics
        gameState.playerVelocity += GRAVITY;
        gameState.playerY += gameState.playerVelocity;

        // Generate pipes
        if (gameState.frameCount % 90 === 0) {
          const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
          gameState.pipes.push({
            x: canvas.width,
            topHeight,
            scored: false,
          });
        }

        // Update and draw pipes
        gameState.pipes = gameState.pipes.filter((pipe) => {
          pipe.x -= PIPE_SPEED;

          // Draw pipe
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          ctx.fillRect(
            pipe.x,
            pipe.topHeight + PIPE_GAP,
            PIPE_WIDTH,
            canvas.height - pipe.topHeight - PIPE_GAP
          );

          // Add pipe border/shadow
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 3;
          ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          ctx.strokeRect(
            pipe.x,
            pipe.topHeight + PIPE_GAP,
            PIPE_WIDTH,
            canvas.height - pipe.topHeight - PIPE_GAP
          );

          // Check scoring
          if (!pipe.scored && pipe.x + PIPE_WIDTH < canvas.width / 2 - PLAYER_SIZE / 2) {
            pipe.scored = true;
            setScore((prev) => prev + 1);
          }

          // Check collision
          const playerLeft = canvas.width / 2 - PLAYER_SIZE / 2;
          const playerRight = playerLeft + PLAYER_SIZE;
          const playerTop = gameState.playerY;
          const playerBottom = playerTop + PLAYER_SIZE;

          if (
            pipe.x < playerRight &&
            pipe.x + PIPE_WIDTH > playerLeft &&
            (playerTop < pipe.topHeight || playerBottom > pipe.topHeight + PIPE_GAP)
          ) {
            gameState.isGameOver = true;
            onGameOver(score);
          }

          return pipe.x > -PIPE_WIDTH;
        });

        gameState.frameCount++;

        // Check ground/ceiling collision
        if (gameState.playerY > canvas.height - PLAYER_SIZE || gameState.playerY < 0) {
          gameState.isGameOver = true;
          onGameOver(score);
        }
      }

      // Draw player (face)
      ctx.save();
      ctx.translate(canvas.width / 2, gameState.playerY + PLAYER_SIZE / 2);
      
      // Rotate based on velocity
      const rotation = Math.min(Math.max(gameState.playerVelocity * 0.05, -0.5), 0.5);
      ctx.rotate(rotation);

      // Draw face (uploaded or default Sura face)
      if (faceImg.complete) {
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          faceImg,
          -PLAYER_SIZE / 2,
          -PLAYER_SIZE / 2,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
      }

      // Add shadow/glow
      ctx.restore();
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
      ctx.shadowBlur = 10;

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, faceImage, score, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-sky px-4">
      {/* Score Display */}
      <div className="mb-4 text-center">
        <div className="inline-block bg-card px-8 py-3 rounded-2xl shadow-game">
          <p className="text-5xl font-bold text-game-score">{score}</p>
        </div>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="rounded-2xl shadow-intense border-4 border-white/50"
      />

      {/* Instructions */}
      {!isPlaying && (
        <div className="mt-6 text-center animate-bounce">
          <p className="text-xl font-semibold text-foreground">
            Click, tap, or press SPACE to flap! 🚀
          </p>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
