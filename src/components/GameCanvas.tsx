import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import suraFaceDefault from "@/assets/sura-face-cutout.png";

interface GameCanvasProps {
  onGameOver: (score: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

const GRAVITY = 0.3; // Reduced for easier gameplay
const FLAP_STRENGTH = -8; // Reduced for smoother control
const PIPE_WIDTH = 80;
const PIPE_GAP = 280; // Increased gap for easier passage
const PIPE_SPEED = 2; // Reduced speed
const PLAYER_SIZE = 50; // Slightly larger
const SEASON_CHANGE_INTERVAL = 10; // Score interval for season change

const GameCanvas = ({ onGameOver }: GameCanvasProps) => {
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

  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playHappyScream = useCallback(() => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // Girl's happy scream - higher pitched, quick ascending
    oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContextRef.current.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.35, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.15);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.15);
  }, []);

  const playSadScream = useCallback(() => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // Girl's sad scream - higher pitched, dramatic descending
    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContextRef.current.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0.45, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.4);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.4);
  }, []);

  const flap = useCallback(() => {
    if (gameStateRef.current.isGameOver) return;
    
    gameStateRef.current.playerVelocity = FLAP_STRENGTH;
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }, [isPlaying]);

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
    let raindrops: Array<{ x: number; y: number; speed: number; length: number }> = [];
    let lightningFrame = 0;

    // Load default Sura face
    const faceImg = new Image();
    faceImg.onload = () => {
      console.log('Face image loaded successfully');
    };
    faceImg.src = suraFaceDefault;

    // Initialize raindrops
    for (let i = 0; i < 100; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 5 + 5,
        length: Math.random() * 15 + 10
      });
    }

    const gameLoop = () => {
      if (gameState.isGameOver) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine season based on score
      const season = Math.floor(score / SEASON_CHANGE_INTERVAL) % 4;
      // 0: Spring (0-9), 1: Autumn (10-19), 2: Winter (20-29), 3: Storm (30-39), then cycles

      // Draw sky gradient based on season
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (season === 0) {
        // Spring - bright blue sky
        gradient.addColorStop(0, "#bae6fd");
        gradient.addColorStop(1, "#7dd3fc");
      } else if (season === 1) {
        // Autumn - orange/warm sky
        gradient.addColorStop(0, "#fbbf24");
        gradient.addColorStop(1, "#f97316");
      } else if (season === 2) {
        // Winter - pale/cold sky
        gradient.addColorStop(0, "#cbd5e1");
        gradient.addColorStop(1, "#94a3b8");
      } else {
        // Storm - dark sky
        gradient.addColorStop(0, "#1e293b");
        gradient.addColorStop(1, "#475569");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw sun/moon based on season
      if (season === 0) {
        // Spring - bright yellow sun
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(canvas.width - 60, 60, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(
            canvas.width - 60 + Math.cos(angle) * 40,
            60 + Math.sin(angle) * 40
          );
          ctx.lineTo(
            canvas.width - 60 + Math.cos(angle) * 50,
            60 + Math.sin(angle) * 50
          );
          ctx.stroke();
        }
      } else if (season === 1) {
        // Autumn - orange sun
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.arc(canvas.width - 60, 60, 35, 0, Math.PI * 2);
        ctx.fill();
      } else if (season === 2) {
        // Winter - pale sun/snowflakes
        ctx.fillStyle = "#e0e7ff";
        ctx.beginPath();
        ctx.arc(canvas.width - 60, 60, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw falling snowflakes
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 30; i++) {
          const x = (gameState.frameCount * 0.3 + i * 40) % canvas.width;
          const y = ((gameState.frameCount * 2 + i * 50) % canvas.height);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw clouds
      const drawCloud = (x: number, y: number, scale: number) => {
        if (season === 3) {
          ctx.fillStyle = "#64748b"; // Dark clouds for storm
        } else if (season === 1) {
          ctx.fillStyle = "#fef3c7"; // Yellowish clouds for autumn
        } else {
          ctx.fillStyle = "#ffffff"; // White clouds
        }
        ctx.beginPath();
        ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
        ctx.arc(x + 25 * scale, y, 25 * scale, 0, Math.PI * 2);
        ctx.arc(x + 50 * scale, y, 20 * scale, 0, Math.PI * 2);
        ctx.arc(x + 25 * scale, y - 15 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
      };

      // Animate clouds
      const cloudOffset = (gameState.frameCount * 0.5) % (canvas.width + 100);
      drawCloud(cloudOffset - 100, 80, 0.8);
      drawCloud(cloudOffset + 100, 120, 1);
      drawCloud(cloudOffset + 300, 90, 0.9);

      // Draw rain and lightning (only in storm season)
      if (season === 3) {
        // Update and draw raindrops
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        });

        // Lightning effect
        if (Math.random() < 0.01) {
          lightningFrame = 3;
        }

        if (lightningFrame > 0) {
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          const startX = Math.random() * canvas.width;
          let currentX = startX;
          let currentY = 0;
          ctx.moveTo(currentX, currentY);
          
          while (currentY < canvas.height) {
            currentY += Math.random() * 50 + 20;
            currentX += (Math.random() - 0.5) * 40;
            ctx.lineTo(currentX, currentY);
          }
          ctx.stroke();
          
          // Flash effect
          ctx.fillStyle = `rgba(255, 255, 255, ${lightningFrame * 0.1})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          lightningFrame--;
        }
      }

      if (isPlaying) {
        // Update player physics
        gameState.playerVelocity += GRAVITY;
        gameState.playerY += gameState.playerVelocity;

        // Generate pipes
        if (gameState.frameCount % 100 === 0) {
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
            playHappyScream();
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
            playSadScream();
            onGameOver(score);
          }

          return pipe.x > -PIPE_WIDTH;
        });

        gameState.frameCount++;

        // Check ground/ceiling collision
        if (gameState.playerY > canvas.height - PLAYER_SIZE || gameState.playerY < 0) {
          gameState.isGameOver = true;
          playSadScream();
          onGameOver(score);
        }
      }

      // Draw player (face with transparent background)
      ctx.save();
      ctx.translate(canvas.width / 2, gameState.playerY + PLAYER_SIZE / 2);
      
      // Rotate based on velocity
      const rotation = Math.min(Math.max(gameState.playerVelocity * 0.05, -0.5), 0.5);
      ctx.rotate(rotation);

      // Draw face with transparent background preserved
      if (faceImg.complete) {
        ctx.drawImage(
          faceImg,
          -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE
        );
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, score, onGameOver, playHappyScream, playSadScream]);

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
