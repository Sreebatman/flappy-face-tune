import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Upload } from "lucide-react";

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onBackToStart: () => void;
}

const GameOverScreen = ({ score, onRestart, onBackToStart }: GameOverScreenProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-sky px-4">
      <Card className="w-full max-w-md p-8 shadow-intense text-center">
        <div className="mb-6">
          <h2 className="text-6xl font-bold mb-2 text-destructive">
            Game Over!
          </h2>
          <p className="text-muted-foreground text-lg">
            Better luck next time! 💪
          </p>
        </div>

        {/* Score Display */}
        <div className="mb-8">
          <p className="text-lg text-muted-foreground mb-2">Your Score</p>
          <div className="inline-block bg-game-score/10 px-12 py-6 rounded-2xl border-2 border-game-score">
            <p className="text-7xl font-bold text-game-score">{score}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onRestart}
            className="w-full h-14 text-lg font-bold bg-gradient-button shadow-game hover:shadow-intense transition-all hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>

        {/* Fun Message */}
        <p className="mt-6 text-sm text-muted-foreground italic">
          "Keep flapping, champion! 🏆"
        </p>
      </Card>
    </div>
  );
};

export default GameOverScreen;
