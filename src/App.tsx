import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import TicTacToe from "./pages/TicTacToe";
import NumberGuess from "./pages/NumberGuess";
import WordGuess from "./pages/WordGuess";
import MemoryMatch from "./pages/MemoryMatch";
import PuzzleTime from "./pages/PuzzleTime";
import Sudoku from "./pages/Sudoku";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tic-tac-toe"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <TicTacToe />
                </ProtectedRoute>
              }
            />
            <Route
              path="/number-guess"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <NumberGuess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/word-guess"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <WordGuess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/memory-match"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <MemoryMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/puzzle-time"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <PuzzleTime />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sudoku"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Sudoku />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
