import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, RotateCcw, Trophy, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { ThreeBackground } from "@/components/ThreeBackground";

type Difficulty = "easy" | "medium" | "hard";
type GameMode = "computer" | "friend";

interface Card {
  id: number;
  value: number;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<GameMode>("computer");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">("player1");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const getGridSize = () => {
    switch (difficulty) {
      case "easy":
        return 4; // 4x4 = 16 cards = 8 pairs
      case "medium":
        return 6; // 6x6 = 36 cards = 18 pairs
      case "hard":
        return 8; // 8x8 = 64 cards = 32 pairs
    }
  };

  const initializeGame = () => {
    const size = getGridSize();
    const pairs = (size * size) / 2;
    const values = Array.from({ length: pairs }, (_, i) => i + 1);
    const cardValues = [...values, ...values].sort(() => Math.random() - 0.5);

    const newCards: Card[] = cardValues.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false,
    }));

    setCards(newCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameWon(false);
    setTime(0);
    setCurrentPlayer("player1");
    setScores({ player1: 0, player2: 0 });
    setGameStarted(true);
  };

  useEffect(() => {
    if (gameStarted && !gameWon) {
      const timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameWon]);

  const handleCardClick = (index: number) => {
    if (!gameStarted || gameWon) return;
    if (cards[index].flipped || cards[index].matched) return;
    if (flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;
      const match = newCards[first].value === newCards[second].value;

      setTimeout(() => {
        if (match) {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setMatches((prev) => prev + 1);
          
          if (mode === "friend") {
            setScores((prev) => ({
              ...prev,
              [currentPlayer]: prev[currentPlayer] + 1,
            }));
          }
        } else {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          if (mode === "friend") {
            setCurrentPlayer((prev) => (prev === "player1" ? "player2" : "player1"));
          }
        }

        setCards(newCards);
        setFlippedCards([]);

        const totalPairs = (getGridSize() * getGridSize()) / 2;
        if (matches + 1 === totalPairs) {
          setGameWon(true);
          handleGameComplete();
        }
      }, 1000);
    }
  };

  const handleGameComplete = async () => {
    const totalPairs = (getGridSize() * getGridSize()) / 2;
    const score = totalPairs * 100 - moves * 10 - time;

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const currentStats = userSnap.exists() ? userSnap.data().stats?.memoryMatch || {} : {};

        const newBestScore = Math.max(score, currentStats.bestScore || 0);
        const newBestTime = !currentStats.bestTime || time < currentStats.bestTime ? time : currentStats.bestTime;

        await updateDoc(userRef, {
          "stats.memoryMatch": {
            bestScore: newBestScore,
            bestTime: newBestTime,
            gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
            difficulty,
            lastPlayed: new Date().toISOString(),
          },
        });

        toast.success(`Game completed! Score: ${score}`);
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const gridSize = getGridSize();
  const totalPairs = (gridSize * gridSize) / 2;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} disabled={gameStarted}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={(v) => setMode(v as GameMode)} disabled={gameStarted}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer">vs Computer</SelectItem>
                  <SelectItem value="friend">vs Friend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={initializeGame} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {gameStarted ? "Restart" : "Start Game"}
            </Button>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-2 shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Matches</p>
              <p className="text-2xl font-bold">{matches} / {totalPairs}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moves</p>
              <p className="text-2xl font-bold">{moves}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Clock className="w-5 h-5" />
                {formatTime(time)}
              </p>
            </div>
            {mode === "friend" && (
              <div>
                <p className="text-sm text-muted-foreground">Current Player</p>
                <p className="text-2xl font-bold">{currentPlayer === "player1" ? "Player 1" : "Player 2"}</p>
              </div>
            )}
          </div>
          {mode === "friend" && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Player 1</p>
                <p className="text-xl font-bold">{scores.player1}</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Player 2</p>
                <p className="text-xl font-bold">{scores.player2}</p>
              </div>
            </div>
          )}
        </Card>

        {gameWon && (
          <Card className="bg-success/20 border-success mb-6 text-center p-6">
            <Trophy className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
            <p className="text-lg">You completed the game in {formatTime(time)} with {moves} moves!</p>
          </Card>
        )}

        {gameStarted && (
          <div
            className="grid gap-2 max-w-4xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                disabled={card.flipped || card.matched || gameWon}
                className={`aspect-square rounded-lg transition-all duration-300 ${
                  card.matched
                    ? "bg-success/50 border-2 border-success"
                    : card.flipped
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border hover:border-primary hover:scale-105"
                } ${card.flipped || card.matched ? "cursor-default" : "cursor-pointer"}`}
              >
                {card.flipped || card.matched ? (
                  <span className="text-2xl font-bold">{card.value}</span>
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </button>
            ))}
          </div>
        )}

        {!gameStarted && (
          <Card className="bg-card/80 backdrop-blur-xl border-2 text-center p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Memory Match Game</h2>
            <p className="text-muted-foreground mb-6">
              Match pairs of cards to win! Select your difficulty and mode, then click "Start Game" to begin.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <p><strong>Easy:</strong> 4x4 grid (8 pairs)</p>
              <p><strong>Medium:</strong> 6x6 grid (18 pairs)</p>
              <p><strong>Hard:</strong> 8x8 grid (32 pairs)</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;

