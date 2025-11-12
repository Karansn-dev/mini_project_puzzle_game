import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, RotateCcw, Trophy, Clock, Shuffle } from "lucide-react";
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

const PuzzleTime = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<GameMode>("computer");
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">("player1");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const getGridSize = () => {
    switch (difficulty) {
      case "easy":
        return 3; // 3x3 puzzle
      case "medium":
        return 4; // 4x4 puzzle
      case "hard":
        return 5; // 5x5 puzzle
    }
  };

  const createSolvedPuzzle = (size: number): number[] => {
    const total = size * size;
    return Array.from({ length: total - 1 }, (_, i) => i + 1).concat(0);
  };

  const shufflePuzzle = (arr: number[]): number[] => {
    const shuffled = [...arr];
    let emptyIdx = shuffled.length - 1;
    
    // Make random valid moves to shuffle
    for (let i = 0; i < 1000; i++) {
      const size = Math.sqrt(shuffled.length);
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;
      const directions = [
        { row: row - 1, col }, // up
        { row: row + 1, col }, // down
        { row, col: col - 1 }, // left
        { row, col: col + 1 }, // right
      ].filter(
        (d) =>
          d.row >= 0 &&
          d.row < size &&
          d.col >= 0 &&
          d.col < size
      );

      if (directions.length > 0) {
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newIdx = randomDir.row * size + randomDir.col;
        [shuffled[emptyIdx], shuffled[newIdx]] = [shuffled[newIdx], shuffled[emptyIdx]];
        emptyIdx = newIdx;
      }
    }

    return shuffled;
  };

  const initializeGame = () => {
    const size = getGridSize();
    const solved = createSolvedPuzzle(size);
    const shuffled = shufflePuzzle(solved);
    const emptyIdx = shuffled.indexOf(0);

    setPuzzle(shuffled);
    setEmptyIndex(emptyIdx);
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

  useEffect(() => {
    if (gameStarted && !gameWon) {
      const size = getGridSize();
      const solved = createSolvedPuzzle(size);
      const isSolved = puzzle.every((val, idx) => val === solved[idx]);
      
      if (isSolved) {
        setGameWon(true);
        handleGameComplete();
      }
    }
  }, [puzzle, gameStarted, gameWon]);

  const canMove = (index: number): boolean => {
    const size = getGridSize();
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;
    const tileRow = Math.floor(index / size);
    const tileCol = index % size;

    return (
      (Math.abs(emptyRow - tileRow) === 1 && emptyCol === tileCol) ||
      (Math.abs(emptyCol - tileCol) === 1 && emptyRow === tileRow)
    );
  };

  const handleTileClick = (index: number) => {
    if (!gameStarted || gameWon) return;
    if (puzzle[index] === 0) return;
    if (!canMove(index)) return;

    const newPuzzle = [...puzzle];
    [newPuzzle[emptyIndex], newPuzzle[index]] = [newPuzzle[index], newPuzzle[emptyIndex]];
    
    setPuzzle(newPuzzle);
    setEmptyIndex(index);
    setMoves((prev) => prev + 1);

    if (mode === "friend") {
      setCurrentPlayer((prev) => (prev === "player1" ? "player2" : "player1"));
    }
  };

  const handleGameComplete = async () => {
    const score = 10000 - moves * 10 - time * 5;

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const currentStats = userSnap.exists() ? userSnap.data().stats?.puzzleTime || {} : {};

        const newBestTime = !currentStats.bestTime || time < currentStats.bestTime ? time : currentStats.bestTime;
        const newBestMoves = !currentStats.bestMoves || moves < currentStats.bestMoves ? moves : currentStats.bestMoves;

        await updateDoc(userRef, {
          "stats.puzzleTime": {
            bestTime: newBestTime,
            bestMoves: newBestMoves,
            bestScore: Math.max(score, currentStats.bestScore || 0),
            gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
            difficulty,
            lastPlayed: new Date().toISOString(),
          },
        });

        toast.success(`Puzzle solved! Time: ${formatTime(time)}, Moves: ${moves}`);
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
                  <SelectItem value="easy">Easy (3x3)</SelectItem>
                  <SelectItem value="medium">Medium (4x4)</SelectItem>
                  <SelectItem value="hard">Hard (5x5)</SelectItem>
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
              {gameStarted ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </>
              ) : (
                <>
                  <Shuffle className="w-4 h-4" />
                  Start Game
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-2 shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Current Player</p>
                  <p className="text-2xl font-bold">{currentPlayer === "player1" ? "Player 1" : "Player 2"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Player 1 Score</p>
                  <p className="text-2xl font-bold">{scores.player1}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {gameWon && (
          <Card className="bg-success/20 border-success mb-6 text-center p-6">
            <Trophy className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Puzzle Solved! 🎉</h2>
            <p className="text-lg">Completed in {formatTime(time)} with {moves} moves!</p>
          </Card>
        )}

        {gameStarted && (
          <div className="max-w-2xl mx-auto">
            <div
              className="grid gap-2 bg-card/60 backdrop-blur-sm p-4 rounded-lg border-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.map((value, index) => (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={value === 0 || gameWon || !canMove(index)}
                  className={`aspect-square rounded-lg text-2xl font-bold transition-all duration-300 ${
                    value === 0
                      ? "bg-transparent border-0 cursor-default"
                      : canMove(index) && !gameWon
                      ? "bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg cursor-pointer border-2 border-primary"
                      : "bg-card border-2 border-border cursor-not-allowed opacity-60"
                  }`}
                >
                  {value !== 0 && value}
                </button>
              ))}
            </div>
          </div>
        )}

        {!gameStarted && (
          <Card className="bg-card/80 backdrop-blur-xl border-2 text-center p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Puzzle Time</h2>
            <p className="text-muted-foreground mb-6">
              Slide the tiles to arrange them in numerical order from 1 to {gridSize * gridSize - 1}. The empty space is at the bottom right.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <p><strong>Easy:</strong> 3x3 grid (8 tiles)</p>
              <p><strong>Medium:</strong> 4x4 grid (15 tiles)</p>
              <p><strong>Hard:</strong> 5x5 grid (24 tiles)</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PuzzleTime;

