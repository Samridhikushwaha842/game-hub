import { useState } from "react";
import TicTacToe from "./components/TicTacToe";
import MemoryGame from "./components/MemoryGame";
import Snake from "./components/Snake";
import "./App.css";

const GAMES = [
  { id: "ttt", label: "Tic Tac Toe", icon: "❌", Component: TicTacToe },
  { id: "memory", label: "Memory Match", icon: "🧠", Component: MemoryGame },
  { id: "snake", label: "Snake", icon: "🐍", Component: Snake },
];

export default function App() {
  const [active, setActive] = useState("ttt");
  const Current = GAMES.find((g) => g.id === active).Component;

  return (
    <div className="app">
      <header className="header">
        <h1>🎮 Game Hub</h1>
        <p>Built with React by Samridhi Kushwaha</p>
      </header>

      <nav className="tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={`tab ${active === g.id ? "active" : ""}`}
            onClick={() => setActive(g.id)}
          >
            <span>{g.icon}</span> {g.label}
          </button>
        ))}
      </nav>

      <main className="card">
        <Current />
      </main>

      <footer className="footer">
        <a
          href="https://github.com/Samridhikushwaha842"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}