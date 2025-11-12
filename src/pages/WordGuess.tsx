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
          className={`inline-flex items-center justify-center w-12 h-16 md:w-16 md:h-20 m-1 text-3xl md:text-4xl font-bold rounded-xl transition-all duration-300 ${
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
      className={`w-8 h-8 ${
        i < maxWrongGuesses - wrongGuesses
          ? "fill-red-500 text-red-500"
          : "fill-gray-300 text-gray-300"
      } transition-all duration-300`}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-red-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <Button variant="outline" size="lg" className="gap-2 rounded-full">
            <Home className="w-5 h-5" />
            Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold gradient-candy bg-clip-text text-transparent">
          Word Guessing
        </h1>
        <Button
          variant="outline"
          size="lg"
          onClick={startNewGame}
          className="gap-2 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </Button>
      </header>

      {/* Game Area */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 shadow-playful bg-white/80 backdrop-blur">
          {/* Status */}
          <div className="text-center mb-8">
            {gameWon ? (
              <div className="animate-bounce-in">
                <Trophy className="w-16 h-16 text-warning mx-auto mb-4 animate-wiggle" />
                <h2 className="text-4xl font-bold text-success mb-2">
                  You Won! 🎉
                </h2>
                <p className="text-xl text-muted-foreground">
                  The word was: {currentWord}
                </p>
              </div>
            ) : gameLost ? (
              <div className="animate-bounce-in">
                <h2 className="text-4xl font-bold text-destructive mb-2">
                  Game Over! 😔
                </h2>
                <p className="text-xl text-muted-foreground">
                  The word was: {currentWord}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Guess the Word!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Hint: {hint}
                </p>
              </div>
            )}
          </div>

          {/* Lives */}
          <div className="flex justify-center gap-2 mb-8">{hearts}</div>

          {/* Word Display */}
          <div className="flex flex-wrap justify-center mb-8">
            {displayWord()}
          </div>

          {/* Keyboard */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-7 md:grid-cols-9 gap-2">
              {alphabet.map((letter) => {
                const isGuessed = guessedLetters.has(letter);
                const isCorrect = isGuessed && currentWord.includes(letter);
                const isWrong = isGuessed && !currentWord.includes(letter);

                return (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={isGuessed || gameWon || gameLost}
                    className={`aspect-square rounded-xl text-xl md:text-2xl font-bold transition-all duration-300 ${
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
          <div className="mt-8 text-center text-muted-foreground">
            <p className="text-lg">
              Click letters to guess the word! You have {maxWrongGuesses} chances.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WordGuess;
