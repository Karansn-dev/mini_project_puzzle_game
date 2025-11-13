import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NumberGuess = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [history, setHistory] = useState<{ guess: number; hint: string }[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [maxAttempts] = useState(10);

  const startNewGame = () => {
    const newNumber = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newNumber);
    setGuess("");
    setAttempts(0);
    setHistory([]);
    setGameWon(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGuess = () => {
    const numGuess = parseInt(guess);

    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      toast.error("Please enter a number between 1 and 100!");
      return;
    }

    if (history.some((h) => h.guess === numGuess)) {
      toast.error("You already guessed this number!");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (numGuess === targetNumber) {
      setGameWon(true);
      toast.success(`🎉 Correct! You won in ${newAttempts} attempts!`, {
        duration: 4000,
      });
      setHistory([...history, { guess: numGuess, hint: "🎯 Perfect!" }]);
    } else {
      const difference = Math.abs(targetNumber - numGuess);
      let hint = "";

      if (difference <= 5) {
        hint = "🔥 Super hot!";
      } else if (difference <= 10) {
        hint = "😊 Getting warm!";
      } else if (difference <= 20) {
        hint = "😐 A bit cold";
      } else {
        hint = "🥶 Very cold!";
      }

      if (numGuess < targetNumber) {
        hint += " Try higher! ⬆️";
      } else {
        hint += " Try lower! ⬇️";
      }

      setHistory([...history, { guess: numGuess, hint }]);
      setGuess("");

      if (newAttempts >= maxAttempts) {
        toast.error(`Game Over! The number was ${targetNumber}`, {
          duration: 4000,
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !gameWon && attempts < maxAttempts) {
      handleGuess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs sm:text-sm">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent text-center">
          Number Guessing
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={startNewGame}
          className="gap-2 rounded-full text-xs sm:text-sm"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">New Game</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      {/* Game Area */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-3xl">
        <Card className="p-4 sm:p-6 md:p-8 shadow-playful bg-white/80 backdrop-blur">
          {/* Status */}
          <div className="text-center mb-6 sm:mb-8">
            {gameWon ? (
              <div className="animate-bounce-in">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-warning mx-auto mb-4 animate-wiggle" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-success mb-2">
                  Amazing! You Won! 🎉
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  You guessed the number in {attempts} attempts!
                </p>
              </div>
            ) : attempts >= maxAttempts ? (
              <div className="animate-bounce-in">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-destructive mb-2">
                  Game Over! 😔
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  The number was {targetNumber}. Try again!
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Guess a number between 1 and 100!
                </h2>
                <div className="flex items-center justify-center gap-4 text-sm sm:text-base md:text-lg">
                  <span className="text-muted-foreground">
                    Attempts: {attempts}/{maxAttempts}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          {!gameWon && attempts < maxAttempts && (
            <div className="max-w-md mx-auto mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your guess..."
                  className="text-lg sm:text-xl md:text-2xl text-center h-12 sm:h-14 md:h-16 rounded-full"
                  min="1"
                  max="100"
                />
                <Button
                  size="lg"
                  onClick={handleGuess}
                  className="gradient-ocean text-white rounded-full px-6 sm:px-8 text-base sm:text-lg md:text-xl font-bold hover:scale-105 transition-transform"
                >
                  Guess!
                </Button>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Your Guesses:</h3>
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {[...history].reverse().map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-xl ${
                      item.hint.includes("Perfect")
                        ? "bg-success/20 border-2 border-success"
                        : "bg-muted"
                    } animate-bounce-in`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl sm:text-2xl font-bold">{item.guess}</span>
                      <span className="text-xs sm:text-sm text-right flex-shrink-0">{item.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 text-center text-muted-foreground">
            <p className="text-sm sm:text-base md:text-lg">
              💡 Tip: The hints will tell you if you're hot or cold!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NumberGuess;
