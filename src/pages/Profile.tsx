import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Trophy, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { ThreeBackground } from "@/components/ThreeBackground";

interface GameStats {
  bestScore?: number;
  bestTime?: number;
  gamesPlayed?: number;
  difficulty?: string;
}

interface UserStats {
  memoryMatch?: GameStats;
  puzzleTime?: GameStats;
  sudoku?: GameStats;
}

const Profile = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStats(userData.stats || {});
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) => (
    <Card className="bg-card/60 backdrop-blur-sm border-2">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold mt-2 truncate">{value}</p>
          </div>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="outline" className="gap-2 text-sm sm:text-base">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-xl border-2 shadow-2xl mb-4 sm:mb-6">
            <CardHeader className="px-4 sm:px-6 pt-6">
              <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Profile
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Your gaming statistics and achievements</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg sm:text-xl font-semibold break-words">{currentUser?.displayName || "User"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg sm:text-xl font-semibold break-all">{currentUser?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
            <StatCard
              title="Memory Match"
              value={stats.memoryMatch?.bestScore || 0}
              icon={Trophy}
            />
            <StatCard
              title="Puzzle Time"
              value={stats.puzzleTime?.bestTime ? `${stats.puzzleTime.bestTime}s` : "N/A"}
              icon={Clock}
            />
            <StatCard
              title="Sudoku"
              value={stats.sudoku?.bestTime ? `${stats.sudoku.bestTime}s` : "N/A"}
              icon={Target}
            />
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border-2">
            <CardHeader className="px-4 sm:px-6 pt-6">
              <CardTitle className="text-xl sm:text-2xl">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <div className="space-y-4">
                {Object.entries(stats).map(([game, gameStats]) => (
                  <div key={game} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold text-base sm:text-lg capitalize mb-2">{game}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      {gameStats.bestScore && (
                        <div>
                          <p className="text-muted-foreground">Best Score</p>
                          <p className="font-semibold">{gameStats.bestScore}</p>
                        </div>
                      )}
                      {gameStats.bestTime && (
                        <div>
                          <p className="text-muted-foreground">Best Time</p>
                          <p className="font-semibold">{gameStats.bestTime}s</p>
                        </div>
                      )}
                      {gameStats.gamesPlayed && (
                        <div>
                          <p className="text-muted-foreground">Games Played</p>
                          <p className="font-semibold">{gameStats.gamesPlayed}</p>
                        </div>
                      )}
                      {gameStats.difficulty && (
                        <div>
                          <p className="text-muted-foreground">Difficulty</p>
                          <p className="font-semibold capitalize">{gameStats.difficulty}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {Object.keys(stats).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No statistics yet. Start playing games to see your stats here!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

