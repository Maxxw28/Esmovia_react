import React, { useEffect, useRef, useState } from "react";

export default function CrashGame() {
  const [gameState, setGameState] = useState("waiting"); // waiting | running | crashed
  const [multiplier, setMultiplier] = useState(1);
  const [crashPoint, setCrashPoint] = useState(null);
  const [bet, setBet] = useState(10);
  const [cashedOut, setCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(null);
  const [history, setHistory] = useState([]); // historia crashów (mnożników)
  const intervalRef = useRef(null);

  useEffect(() => {
    if (gameState === "running") {
      intervalRef.current = setInterval(() => {
        setMultiplier((prev) => {
          const newMult = +(prev * 1.01).toFixed(2);

          if (crashPoint !== null && newMult >= crashPoint) {
            clearInterval(intervalRef.current);
            setGameState("crashed");
            if (!cashedOut) {
              setWinnings(0);
              setCashoutMultiplier(null);
            }
            return crashPoint;
          }
          return newMult;
        });
      }, 100);
    }

    return () => clearInterval(intervalRef.current);
  }, [gameState, crashPoint, cashedOut]);

  useEffect(() => {
    if (gameState === "crashed" && crashPoint !== null) {
      setHistory((h) => {
        const newHistory = [crashPoint, ...h];
        return newHistory.slice(0, 10);
      });
    }
  }, [gameState, crashPoint]);

  const generateCrashPoint = () => {
    const rand = Math.random();

    if (rand < 0.15) {
      return 1.0;
    } else if (rand < 0.5) {
      return parseFloat((1 + Math.random()).toFixed(2));
    } else {
      return parseFloat((2 + Math.random() * 4.5).toFixed(2));
    }
  };

  const startGame = () => {
    const generatedCrash = generateCrashPoint();
    setCrashPoint(generatedCrash);
    setGameState("running");
    setMultiplier(1);
    setCashedOut(false);
    setWinnings(0);
    setCashoutMultiplier(null);
  };

  const handleCashout = () => {
    if (gameState === "running" && !cashedOut) {
      setCashedOut(true);
      setWinnings(parseFloat((bet * multiplier).toFixed(2)));
      setCashoutMultiplier(multiplier);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-2 mb-5 p-5 text-center font-sans">
      {/* Historia mnożników */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {history.length === 0 && (
          <div className="text-gray-500 text-sm">No history yet</div>
        )}
        {history.map((val, i) => (
          <div
            key={i}
            title={`Crash at ${val.toFixed(2)}x`}
            className="bg-blue-500 text-white rounded-2xl px-3 py-1 text-sm font-bold min-w-[50px] select-none"
          >
            {val.toFixed(2)}x
          </div>
        ))}
      </div>

      <h1 className="mb-5 text-2xl font-semibold">🚀 Crash Game</h1>

      <div className="text-6xl font-bold font-mono mb-5">
        {gameState === "crashed" ? "💥" : multiplier.toFixed(2)}x
      </div>

      {gameState === "waiting" && (
        <input
          type="number"
          min="1"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="p-2 w-full text-lg mb-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <div className="flex justify-center gap-2">
        {gameState === "waiting" && (
          <button
            onClick={startGame}
            className="bg-blue-500 text-white px-5 py-2 rounded-md font-bold text-lg hover:bg-blue-600 transition"
          >
            Start
          </button>
        )}

        {gameState === "running" && !cashedOut && (
          <button
            onClick={handleCashout}
            className="bg-red-500 text-white px-5 py-2 rounded-md font-bold text-lg hover:bg-red-600 transition"
          >
            Cashout
          </button>
        )}

        {gameState === "running" && cashedOut && (
          <div className="px-5 py-2 rounded-md font-bold text-lg text-green-600 border-2 border-green-600 inline-block min-w-[130px]">
            You won {winnings} points
          </div>
        )}

        {gameState === "crashed" && (
          <button
            onClick={() => setGameState("waiting")}
            className="bg-green-600 text-white px-5 py-2 rounded-md font-bold text-lg hover:bg-green-700 transition"
          >
            Next Round
          </button>
        )}
      </div>

      {gameState === "crashed" && (
        <div className="mt-5 text-lg">
          {cashedOut && cashoutMultiplier !== null ? (
            <p>✅ You cashed out at {cashoutMultiplier.toFixed(2)}x</p>
          ) : (
            <p>❌ You crashed!</p>
          )}

          {crashPoint !== null && (
            <p className="text-gray-600 text-sm">
              💥 Crash occurred at: {crashPoint.toFixed(2)}x
            </p>
          )}
        </div>
      )}
    </div>
  );
}
