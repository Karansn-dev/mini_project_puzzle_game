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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <Button variant="outline" size="lg" className="gap-2 rounded-full">
            <Home className="w-5 h-5" />
            Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold gradient-rainbow bg-clip-text text-transparent">
          Tic Tac Toe
        </h1>
        <Button
          variant="outline"
          size="lg"
          onClick={resetGame}
          className="gap-2 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
          New Game
        </Button>
      </header>

      {/* Game Area */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 shadow-playful bg-white/80 backdrop-blur">
          {/* Status */}
          <div className="text-center mb-8">
            {winner ? (
              <div className="animate-bounce-in">
                <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-primary mb-2">
                  {winner === "X" ? "You Won! 🎉" : "Computer Won! 🤖"}
                </h2>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {isXNext ? "Your Turn! (X)" : "Computer's Turn... (O)"}
                </h2>
                {!isXNext && (
                  <div className="text-xl text-muted-foreground animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!isXNext || !!cell || !!winner}
                className={`aspect-square rounded-2xl text-5xl font-bold transition-all duration-300 ${
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
            <p className="text-lg">
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
