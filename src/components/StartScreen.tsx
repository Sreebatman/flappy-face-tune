import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StartScreenProps {
  onStart: (faceImage: string | null, voiceSound: File | null) => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [voiceSound, setVoiceSound] = useState<File | null>(null);

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceSound(file);
    }
  };

  const handleStart = () => {
    onStart(faceImage, voiceSound);
  };

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
          {/* Face Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Upload Face Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFaceUpload}
                className="hidden"
                id="face-upload"
              />
              <label
                htmlFor="face-upload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary transition-all cursor-pointer bg-card hover:bg-muted/50"
              >
                {faceImage ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={faceImage}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="text-sm text-foreground">Face uploaded!</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload face
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Voice Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              Upload Voice Sound (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="hidden"
                id="voice-upload"
              />
              <label
                htmlFor="voice-upload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary transition-all cursor-pointer bg-card hover:bg-muted/50"
              >
                {voiceSound ? (
                  <span className="text-sm text-foreground">
                    🎵 {voiceSound.name}
                  </span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload voice
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-bold bg-gradient-button shadow-game hover:shadow-intense transition-all hover:scale-105"
          >
            Start Game 🚀
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Don't worry! Default assets will be used if you skip uploads.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StartScreen;
