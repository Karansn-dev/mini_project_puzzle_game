import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw, Trophy, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const WORD_LIST = [
  { word: "RAINBOW", hint: "Colors in the sky after rain" },
  { word: "ELEPHANT", hint: "Large animal with a trunk" },
  { word: "BUTTERFLY", hint: "Colorful flying insect" },
  { word: "PIZZA", hint: "Popular food with cheese" },
  { word: "DINOSAUR", hint: "Ancient giant reptile" },
  { word: "ROCKET", hint: "Goes to space" },
  { word: "CASTLE", hint: "Where kings and queens live" },
  { word: "MAGIC", hint: "Tricks and spells" },
  { word: "TREASURE", hint: "Gold and jewels" },
  { word: "DRAGON", hint: "Mythical fire-breathing creature" },
];

const WordGuess = () => {
  const [currentWord, setCurrentWord] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const maxWrongGuesses = 6;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const startNewGame = () => {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    const selected = WORD_LIST[randomIndex];
    setCurrentWord(selected.word);
    setHint(selected.hint);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (currentWord && guessedLetters.size > 0) {
      const allLettersGuessed = currentWord
        .split("")
        .every((letter) => guessedLetters.has(letter));

      if (allLettersGuessed && !gameWon) {
        setGameWon(true);
        toast.success("🎉 You won! Amazing job!", {
          duration: 3000,
        });
      }
    }
  }, [guessedLetters, currentWord, gameWon]);

  useEffect(() => {
    if (wrongGuesses >= maxWrongGuesses && !gameLost) {
      setGameLost(true);
      toast.error(`Game Over! The word was ${currentWord}`, {
        duration: 4000,
      });
    }
  }, [wrongGuesses, gameLost, currentWord]);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.has(letter) || gameWon || gameLost) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      setWrongGuesses(wrongGuesses + 1);
    }
  };

  const displayWord = () => {
    return currentWord
      .split("")
      .map((letter, index) => (
        <span
          key={index}
          className={`inline-flex items-center justify-center w-8 h-10 sm:w-10 sm:h-14 md:w-12 md:h-16 lg:w-16 lg:h-20 m-0.5 sm:m-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
            guessedLetters.has(letter)
              ? "bg-gradient-to-br from-green-400 to-green-600 text-white scale-105 animate-bounce-in"
              : "bg-muted border-2 border-border"
          }`}
        >
          {guessedLetters.has(letter) ? letter : ""}
        </span>
      ));
  };

  const hearts = Array.from({ length: maxWrongGuesses }, (_, i) => (
    <Heart
      key={i}
      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
        i < maxWrongGuesses - wrongGuesses
          ? "fill-red-500 text-red-500"
          : "fill-gray-300 text-gray-300"
      } transition-all duration-300`}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-red-100 overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs sm:text-sm">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-yellow-400 bg-clip-text text-transparent text-center">
          Word Guessing
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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <Card className="p-4 sm:p-6 md:p-8 shadow-playful bg-white/80 backdrop-blur">
          {/* Status */}
          <div className="text-center mb-6 sm:mb-8">
            {gameWon ? (
              <div className="animate-bounce-in">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-warning mx-auto mb-4 animate-wiggle" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-success mb-2">
                  You Won! 🎉
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  The word was: {currentWord}
                </p>
              </div>
            ) : gameLost ? (
              <div className="animate-bounce-in">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-destructive mb-2">
                  Game Over! 😔
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  The word was: {currentWord}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Guess the Word!
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Hint: {hint}
                </p>
              </div>
            )}
          </div>

          {/* Lives */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">{hearts}</div>

          {/* Word Display */}
          <div className="flex flex-wrap justify-center mb-6 sm:mb-8 gap-1 sm:gap-2">
            {displayWord()}
          </div>

          {/* Keyboard */}
          <div className="max-w-full sm:max-w-2xl mx-auto overflow-hidden">
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2">
              {alphabet.map((letter) => {
                const isGuessed = guessedLetters.has(letter);
                const isCorrect = isGuessed && currentWord.includes(letter);
                const isWrong = isGuessed && !currentWord.includes(letter);

                return (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={isGuessed || gameWon || gameLost}
                    className={`aspect-square rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-all duration-300 ${
                      isCorrect
                        ? "bg-success text-white"
                        : isWrong
                        ? "bg-destructive text-white"
                        : "bg-gradient-to-br from-purple-400 to-pink-400 text-white hover:scale-110"
                    } ${
                      isGuessed || gameWon || gameLost
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-playful"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 text-center text-muted-foreground">
            <p className="text-sm sm:text-base md:text-lg">
              Click letters to guess the word! You have {maxWrongGuesses} chances.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WordGuess;
