import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const EMOJIS = ["🚀", "🎮", "🍕", "🐱", "🌈", "⚡", "🎧", "🔥"];

function makeDeck() {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({ id: i, emoji }));
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryGame() {
  const [cards, setCards] = useState(makeDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useLocalStorage("memory-best", null);

  const won = matched.length === cards.length;

  useEffect(() => {
    if (won) setBest((b) => (b === null || moves < b ? moves : b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const handleFlip = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped.map((fid) => cards.find((c) => c.id === fid));
      if (a.emoji === b.emoji) {
        setMatched((m) => [...m, a.id, b.id]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const restart = () => {
    setCards(makeDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <div className="game">
      <div className="scoreboard">
        <div>Moves: <strong>{moves}</strong></div>
        <div>Best: <strong>{best ?? "-"}</strong></div>
      </div>

      {won && <h2 className="status">🎉 Jeet gaye! {moves} moves me.</h2>}

      <div className="memory-grid">
        {cards.map((card) => {
          const isOpen = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${isOpen ? "open" : ""} ${
                matched.includes(card.id) ? "matched" : ""
              }`}
              onClick={() => handleFlip(card.id)}
            >
              {isOpen ? card.emoji : "?"}
            </button>
          );
        })}
      </div>

      <div className="row">
        <button className="btn" onClick={restart}>Restart</button>
      </div>
    </div>
  );
}