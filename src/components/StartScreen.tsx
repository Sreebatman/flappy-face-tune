import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-sky px-4">
      <Card className="w-full max-w-md p-8 shadow-intense">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2 text-primary animate-bounce">
            Flappy Sura 🪶
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your face and voice, then flap away!
          </p>
        </div>

        <div className="space-y-6">
          {/* Start Button */}
          <Button
            onClick={onStart}
            className="w-full h-14 text-lg font-bold bg-gradient-button shadow-game hover:shadow-intense transition-all hover:scale-105"
          >
            Start Game 🚀
          </Button>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Flap with Sura's face and voice! 🪶
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StartScreen;
