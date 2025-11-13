import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, RotateCcw, Trophy, Clock, Eraser, Check } from "lucide-react";
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

interface Cell {
  value: number | null;
  isGiven: boolean;
  isError: boolean;
}

const Sudoku = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<GameMode>("computer");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">("player1");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const getCluesCount = () => {
    switch (difficulty) {
      case "easy":
        return 40; // More clues
      case "medium":
        return 30;
      case "hard":
        return 20; // Fewer clues
    }
  };

  // Generate a valid Sudoku solution
  const generateSolution = (): number[][] => {
    const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

    const isValid = (row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      // Check 3x3 box
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const solve = (row: number, col: number): boolean => {
      if (row === 9) return true;
      if (col === 9) return solve(row + 1, 0);
      if (grid[row][col] !== 0) return solve(row, col + 1);

      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      for (const num of numbers) {
        if (isValid(row, col, num)) {
          grid[row][col] = num;
          if (solve(row, col + 1)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    };

    solve(0, 0);
    return grid;
  };

  // Create puzzle from solution by removing cells
  const createPuzzle = (solution: number[][], clues: number): Cell[][] => {
    const puzzle: Cell[][] = solution.map((row) =>
      row.map((val) => ({ value: val, isGiven: true, isError: false }))
    );

    // Remove cells to create puzzle
    const cellsToRemove = 81 - clues;
    const positions = Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
      .sort(() => Math.random() - 0.5)
      .slice(0, cellsToRemove);

    positions.forEach(([row, col]) => {
      puzzle[row][col] = { value: null, isGiven: false, isError: false };
    });

    return puzzle;
  };

  const initializeGame = () => {
    const solution = generateSolution();
    const clues = getCluesCount();
    const puzzle = createPuzzle(solution, clues);

    setGrid(puzzle);
    setSelectedCell(null);
    setMoves(0);
    setErrors(0);
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
      // Check if puzzle is complete and correct
      const isComplete = grid.every((row) => row.every((cell) => cell.value !== null));
      const hasErrors = grid.some((row) => row.some((cell) => cell.isError));

      if (isComplete && !hasErrors) {
        setGameWon(true);
        handleGameComplete();
      }
    }
  }, [grid, gameStarted, gameWon]);

  const checkCell = (row: number, col: number, value: number | null): boolean => {
    if (value === null) return true;

    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && grid[row][x].value === value) return false;
    }
    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && grid[x][col].value === value) return false;
    }
    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = i + startRow;
        const c = j + startCol;
        if (r !== row && c !== col && grid[r][c].value === value) return false;
      }
    }
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || gameWon) return;
    if (grid[row][col].isGiven) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameWon) return;
    const [row, col] = selectedCell;
    if (grid[row][col].isGiven) return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].value = num;
    
    const isValid = checkCell(row, col, num);
    newGrid[row][col].isError = !isValid;

    if (!isValid) {
      setErrors((prev) => prev + 1);
    }

    setGrid(newGrid);
    setMoves((prev) => prev + 1);

    if (mode === "friend") {
      setCurrentPlayer((prev) => (prev === "player1" ? "player2" : "player1"));
    }
  };

  const handleClearCell = () => {
    if (!selectedCell || gameWon) return;
    const [row, col] = selectedCell;
    if (grid[row][col].isGiven) return;

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].value = null;
    newGrid[row][col].isError = false;
    setGrid(newGrid);
    setMoves((prev) => prev + 1);
  };

  const handleGameComplete = async () => {
    const score = 10000 - moves * 5 - errors * 50 - time * 2;

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const currentStats = userSnap.exists() ? userSnap.data().stats?.sudoku || {} : {};

        const newBestTime = !currentStats.bestTime || time < currentStats.bestTime ? time : currentStats.bestTime;

        await updateDoc(userRef, {
          "stats.sudoku": {
            bestTime: newBestTime,
            bestScore: Math.max(score, currentStats.bestScore || 0),
            gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
            difficulty,
            lastPlayed: new Date().toISOString(),
          },
        });

        toast.success(`Sudoku solved! Time: ${formatTime(time)}, Moves: ${moves}`);
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4 sm:mb-6">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex gap-2 flex-1 sm:flex-initial">
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} disabled={gameStarted}>
                <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={(v) => setMode(v as GameMode)} disabled={gameStarted}>
                <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer">vs Computer</SelectItem>
                  <SelectItem value="friend">vs Friend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={initializeGame} className="gap-2 text-sm whitespace-nowrap">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{gameStarted ? "Restart" : "Start Game"}</span>
              <span className="sm:hidden">{gameStarted ? "Restart" : "Start"}</span>
            </Button>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-2 shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Moves</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{moves}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Time</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                {formatTime(time)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Errors</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-destructive">{errors}</p>
            </div>
            {mode === "friend" && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Current Player</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{currentPlayer === "player1" ? "Player 1" : "Player 2"}</p>
              </div>
            )}
          </div>
        </Card>

        {gameWon && (
          <Card className="bg-success/20 border-success mb-4 sm:mb-6 text-center p-4 sm:p-6">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-success mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Sudoku Solved! 🎉</h2>
            <p className="text-sm sm:text-base md:text-lg">Completed in {formatTime(time)} with {moves} moves!</p>
          </Card>
        )}

        {gameStarted && (
          <div className="max-w-full sm:max-w-2xl mx-auto overflow-hidden">
            <div className="grid grid-cols-9 gap-0.5 sm:gap-1 bg-foreground/10 p-1 sm:p-2 rounded-lg border-2">
              {grid.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isSelected =
                    selectedCell && selectedCell[0] === rowIdx && selectedCell[1] === colIdx;
                  const boxRow = Math.floor(rowIdx / 3);
                  const boxCol = Math.floor(colIdx / 3);
                  const isBoxBorder = boxRow % 2 === 0 && boxCol % 2 === 0;

                  return (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      disabled={cell.isGiven || gameWon}
                      className={`aspect-square rounded text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-all ${
                        cell.isGiven
                          ? "bg-primary/20 text-primary font-extrabold cursor-default"
                          : cell.isError
                          ? "bg-destructive/20 text-destructive border-2 border-destructive"
                          : isSelected
                          ? "bg-accent text-accent-foreground border-2 border-accent scale-105"
                          : "bg-card hover:bg-accent/20 border border-border hover:border-accent cursor-pointer"
                      } ${isBoxBorder ? "border-2" : ""}`}
                    >
                      {cell.value || ""}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell || gameWon}
                    className="text-base sm:text-lg md:text-xl font-bold h-10 sm:h-12"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleClearCell}
                disabled={!selectedCell || gameWon}
                variant="outline"
                className="gap-2 text-sm sm:text-base"
              >
                <Eraser className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {!gameStarted && (
          <Card className="bg-card/80 backdrop-blur-xl border-2 text-center p-6 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Sudoku</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Fill the 9x9 grid so that each row, column, and 3x3 box contains all digits from 1 to 9.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto text-sm sm:text-base">
              <p><strong>Easy:</strong> 40+ clues</p>
              <p><strong>Medium:</strong> 30 clues</p>
              <p><strong>Hard:</strong> 20 clues</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Sudoku;

