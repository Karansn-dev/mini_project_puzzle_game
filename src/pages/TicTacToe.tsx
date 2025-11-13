import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Player = "X" | "O" | null;
type Board = Player[];

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const checkWinner = (squares: Board): { winner: Player; line: number[] } => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return { winner: null, line: [] };
  };

  const getComputerMove = (currentBoard: Board): number => {
    // Simple AI: Try to win, then block, then random
    const emptySquares = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null) as number[];

    // Try to win
    for (const square of emptySquares) {
      const testBoard = [...currentBoard];
      testBoard[square] = "O";
      if (checkWinner(testBoard).winner === "O") {
        return square;
      }
    }

    // Try to block
    for (const square of emptySquares) {
      const testBoard = [...currentBoard];
      testBoard[square] = "X";
      if (checkWinner(testBoard).winner === "X") {
        return square;
      }
    }

    // Take center if available
    if (currentBoard[4] === null) return 4;

    // Random move
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      toast.success("🎉 You won! Amazing!", {
        duration: 3000,
      });
      return;
    }

    if (!newBoard.includes(null)) {
      toast("It's a tie! Try again?", {
        duration: 3000,
      });
      return;
    }
  };

  useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(board);
        const newBoard = [...board];
        newBoard[computerMove] = "O";
        setBoard(newBoard);
        setIsXNext(true);

        const result = checkWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.line);
          toast.error("Computer won! Try again!", {
            duration: 3000,
          });
        } else if (!newBoard.includes(null)) {
          toast("It's a tie! Try again?", {
            duration: 3000,
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs sm:text-sm">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent text-center">
          Tic Tac Toe
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="gap-2 rounded-full text-xs sm:text-sm"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">New Game</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      {/* Game Area */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-2xl">
        <Card className="p-4 sm:p-6 md:p-8 shadow-playful bg-white/80 backdrop-blur">
          {/* Status */}
          <div className="text-center mb-6 sm:mb-8">
            {winner ? (
              <div className="animate-bounce-in">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-warning mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                  {winner === "X" ? "You Won! 🎉" : "Computer Won! 🤖"}
                </h2>
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {isXNext ? "Your Turn! (X)" : "Computer's Turn... (O)"}
                </h2>
                {!isXNext && (
                  <div className="text-base sm:text-lg md:text-xl text-muted-foreground animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-8">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!isXNext || !!cell || !!winner}
                className={`aspect-square rounded-xl sm:rounded-2xl text-3xl sm:text-4xl md:text-5xl font-bold transition-all duration-300 ${
                  winningLine.includes(index)
                    ? "bg-success text-white scale-110"
                    : cell === "X"
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                    : cell === "O"
                    ? "bg-gradient-to-br from-pink-400 to-pink-600 text-white"
                    : "bg-white hover:bg-gray-100 hover:scale-105 border-2 border-border"
                } ${
                  !cell && !winner && isXNext
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                } shadow-card hover:shadow-playful`}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center text-muted-foreground">
            <p className="text-sm sm:text-base md:text-lg">
              {winner
                ? "Click 'New Game' to play again!"
                : "Get 3 in a row to win! You are X, Computer is O"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TicTacToe;
