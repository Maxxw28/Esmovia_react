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

  // Aktualizacja mnożnika i obsługa crashu
  useEffect(() => {
    if (gameState === "running") {
      intervalRef.current = setInterval(() => {
        setMultiplier((prev) => {
          const newMult = +(prev * 1.01).toFixed(2);

          if (newMult >= crashPoint) {
            clearInterval(intervalRef.current);
            setGameState("crashed");
            if (!cashedOut) {
              setWinnings(0);
              setCashoutMultiplier(null);
            }
            return crashPoint; // zatrzymujemy mnożnik na crashPoint
          }
          return newMult;
        });
      }, 100);
    }

    return () => clearInterval(intervalRef.current);
  }, [gameState, crashPoint, cashedOut]);

  // Dodawanie crashPoint do historii **TYLKO RAZ** przy wejściu w stan crashed
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
    } else if (rand < 0.50) {
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
      // mnożnik dalej leci
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "10px auto 20px",
        padding: 20,
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Historia mnożników */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 15,
          flexWrap: "wrap",
        }}
      >
        {history.length === 0 && (
          <div style={{ color: "#888", fontSize: 14 }}>No history yet</div>
        )}
        {history.map((val, i) => (
          <div
            key={i}
            title={`Crash at ${val.toFixed(2)}x`}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: 12,
              padding: "4px 10px",
              fontSize: 14,
              fontWeight: "bold",
              minWidth: 50,
              userSelect: "none",
            }}
          >
            {val.toFixed(2)}x
          </div>
        ))}
      </div>

      <h1 style={{ marginBottom: 20 }}>🚀 Crash Game</h1>

      <div
        style={{
          fontSize: 48,
          fontWeight: "bold",
          fontFamily: "monospace",
          marginBottom: 20,
        }}
      >
        {gameState === "crashed" ? "💥" : multiplier.toFixed(2)}x
      </div>

      {gameState === "waiting" && (
        <input
          type="number"
          min="1"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          style={{
            padding: 10,
            width: "100%",
            fontSize: 18,
            marginBottom: 20,
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {gameState === "waiting" && (
          <button
            onClick={startGame}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "10px 20px",
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Start
          </button>
        )}

        {gameState === "running" && !cashedOut && (
          <button
            onClick={handleCashout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              padding: "10px 20px",
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Cashout
          </button>
        )}

        {gameState === "running" && cashedOut && (
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 5,
              fontWeight: "bold",
              fontSize: 16,
              color: "#10b981",
              border: "2px solid #10b981",
              display: "inline-block",
              minWidth: 130,
            }}
          >
            You won {winnings} points
          </div>
        )}

        {gameState === "crashed" && (
          <button
            onClick={() => setGameState("waiting")}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 20px",
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Next Round
          </button>
        )}
      </div>

      {gameState === "crashed" && (
        <div style={{ marginTop: 20, fontSize: 18 }}>
          <p>
            {cashedOut
              ? `✅ You cashed out at ${cashoutMultiplier.toFixed(2)}x`
              : "❌ You crashed!"}
          </p>
          <p style={{ color: "#555", fontSize: 14 }}>
            💥 Crash occurred at: {crashPoint.toFixed(2)}x
          </p>
        </div>
      )}
    </div>
  );
}
