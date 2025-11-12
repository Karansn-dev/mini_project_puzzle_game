import { Link } from "react-router-dom";
import { Gamepad2, Trophy, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const games = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Challenge the computer in this classic game!",
    icon: "❌⭕",
    gradient: "gradient-rainbow",
    path: "/tic-tac-toe"
  },
  {
    id: "number-guess",
    title: "Number Guessing",
    description: "Can you guess the secret number?",
    icon: "🔢",
    gradient: "gradient-ocean",
    path: "/number-guess"
  },
  {
    id: "word-guess",
    title: "Word Guessing",
    description: "Guess the word before time runs out!",
    icon: "🔤",
    gradient: "gradient-candy",
    path: "/word-guess"
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Match the pairs! Coming soon...",
    icon: "🎴",
    gradient: "gradient-sunset",
    path: "#",
    disabled: true
  },
  {
    id: "puzzle",
    title: "Puzzle Time",
    description: "Solve fun puzzles! Coming soon...",
    icon: "🧩",
    gradient: "gradient-forest",
    path: "#",
    disabled: true
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary animate-wiggle" />
            <h1 className="text-3xl font-bold text-primary">Fun Kids Games</h1>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-warning" />
            <span className="text-lg font-semibold">Play & Win!</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="animate-bounce-in">
          <div className="inline-block">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-4 animate-float" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Welcome to Fun Games!
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Choose your favorite game and let's play! 🎮
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game, index) => (
            <Card
              key={game.id}
              className={`group relative overflow-hidden shadow-card hover:shadow-playful transition-all duration-300 hover:scale-105 border-2 ${
                game.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <Link
                to={game.disabled ? "#" : game.path}
                className={`block ${game.disabled ? "pointer-events-none" : ""}`}
              >
                <div className={`${game.gradient} p-6 text-center relative`}>
                  <div className="absolute top-2 right-2">
                    <Star className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-6xl mb-4 group-hover:animate-wiggle">
                    {game.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {game.title}
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    {game.description}
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full font-semibold text-lg rounded-full"
                    disabled={game.disabled}
                  >
                    {game.disabled ? "Coming Soon!" : "Play Now!"}
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t border-border">
        <p className="text-muted-foreground">
          Have fun playing! Made with ❤️ for kids
        </p>
      </footer>
    </div>
  );
};

export default Index;
