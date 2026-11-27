import { useState, useEffect, useRef, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const SIZE = 20;
const SPEED = 130; // ms, kam = tez
const START = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

function randomFood(snake) {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export default function Snake() {
  const [snake, setSnake] = useState(START);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | running | over
  const [best, setBest] = useLocalStorage("snake-best", 0);

  const snakeRef = useRef(START);
  const foodRef = useRef({ x: 15, y: 10 });
  const dir = useRef({ x: 1, y: 0 });
  const pending = useRef({ x: 1, y: 0 });

  const start = () => {
    const f = randomFood(START);
    snakeRef.current = START;
    foodRef.current = f;
    dir.current = { x: 1, y: 0 };
    pending.current = { x: 1, y: 0 };
    setSnake(START);
    setFood(f);
    setScore(0);
    setStatus("running");
  };

  const turn = useCallback((x, y) => {
    // ulta direction allowed nahi
    if (x === -dir.current.x && y === -dir.current.y) return;
    pending.current = { x, y };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: [0, -1], w: [0, -1],
        ArrowDown: [0, 1], s: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0],
      };
      if (map[e.key]) {
        e.preventDefault();
        turn(...map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  // Game loop
  useEffect(() => {
    if (status !== "running") return;

    const id = setInterval(() => {
      dir.current = pending.current;
      const prev = snakeRef.current;
      const head = { x: prev[0].x + dir.current.x, y: prev[0].y + dir.current.y };

      const hitWall = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE;
      const hitSelf = prev.some((s) => s.x === head.x && s.y === head.y);
      if (hitWall || hitSelf) {
        setStatus("over");
        return;
      }

      const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const next = [head, ...prev];
      if (!ate) next.pop();

      snakeRef.current = next;
      setSnake(next);

      if (ate) {
        const f = randomFood(next);
        foodRef.current = f;
        setFood(f);
        setScore((s) => s + 1);
      }
    }, SPEED);

    return () => clearInterval(id);
  }, [status]);

  // Game over par best score update
  useEffect(() => {
    if (status === "over") setBest((b) => Math.max(b, score));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const cells = [];
  const body = new Set(snake.map((s) => `${s.x},${s.y}`));
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let cls = "cell";
      if (x === snake[0].x && y === snake[0].y) cls += " head";
      else if (body.has(`${x},${y}`)) cls += " body";
      else if (x === food.x && y === food.y) cls += " food";
      cells.push(<div key={`${x}-${y}`} className={cls} />);
    }
  }

  return (
    <div className="game">
      <div className="scoreboard">
        <div>Score: <strong>{score}</strong></div>
        <div>Best: <strong>{best}</strong></div>
      </div>

      {status === "idle" && <p className="hint">Arrow keys / WASD se khelo</p>}
      {status === "over" && <h2 className="status">💀 Game Over! Score: {score}</h2>}

      <div
        className="snake-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {cells}
      </div>

      {/* Mobile ke liye on-screen controls */}
      <div className="dpad">
        <button onClick={() => turn(0, -1)}>▲</button>
        <div>
          <button onClick={() => turn(-1, 0)}>◀</button>
          <button onClick={() => turn(0, 1)}>▼</button>
          <button onClick={() => turn(1, 0)}>▶</button>
        </div>
      </div>

      <div className="row">
        <button className="btn" onClick={start}>
          {status === "running" ? "Restart" : status === "over" ? "Play Again" : "Start"}
        </button>
      </div>
    </div>
  );
}