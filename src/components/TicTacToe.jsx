import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] };
    }
  }
  return null;
}

// Agar kisi line me mark ke 2 hain aur 1 khali, to wo khali index return karo
function findMove(board, mark) {
  for (const line of LINES) {
    const marks = line.map((i) => board[i]);
    if (marks.filter((m) => m === mark).length === 2 && marks.includes(null)) {
      return line[marks.indexOf(null)];
    }
  }
  return null;
}

function computerMove(board) {
  let move = findMove(board, "O"); // pehle khud jeetne ki koshish
  if (move !== null) return move;
  move = findMove(board, "X"); // phir user ko block karo
  if (move !== null) return move;
  if (board[4] === null) return 4; // center lo
  const empty = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsComputer, setVsComputer] = useState(true);
  const [scores, setScores] = useLocalStorage("ttt-scores", { X: 0, O: 0, draw: 0 });

  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);
  const gameOver = Boolean(result) || isDraw;

  const applyMove = (i, mark) => {
    if (board[i] || gameOver) return;
    const next = [...board];
    next[i] = mark;
    setBoard(next);
    setXIsNext(mark === "O");

    const w = getWinner(next);
    if (w) setScores((s) => ({ ...s, [w.player]: s[w.player] + 1 }));
    else if (next.every(Boolean)) setScores((s) => ({ ...s, draw: s.draw + 1 }));
  };

  const handleClick = (i) => {
    if (vsComputer && !xIsNext) return; // computer ki baari me click block
    applyMove(i, xIsNext ? "X" : "O");
  };

  // Computer ki chaal
  useEffect(() => {
    if (!vsComputer || xIsNext || gameOver) return;
    const t = setTimeout(() => applyMove(computerMove(board), "O"), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vsComputer, xIsNext, gameOver, board]);

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const toggleMode = () => {
    setVsComputer((v) => !v);
    resetBoard();
  };

  let status;
  if (result) status = `🎉 ${result.player} jeet gaya!`;
  else if (isDraw) status = "🤝 Draw!";
  else status = `Turn: ${xIsNext ? "X" : "O"}`;

  return (
    <div className="game">
      <div className="row">
        <button className="btn small" onClick={toggleMode}>
          Mode: {vsComputer ? "vs Computer" : "vs Friend"}
        </button>
      </div>

      <div className="scoreboard">
        <div>X: <strong>{scores.X}</strong></div>
        <div>Draw: <strong>{scores.draw}</strong></div>
        <div>O: <strong>{scores.O}</strong></div>
      </div>

      <h2 className="status">{status}</h2>

      <div className="ttt-board">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`ttt-cell ${cell ? cell.toLowerCase() : ""} ${
              result && result.line.includes(i) ? "win" : ""
            }`}
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="row">
        <button className="btn" onClick={resetBoard}>New Game</button>
        <button
          className="btn ghost"
          onClick={() => setScores({ X: 0, O: 0, draw: 0 })}
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
}