import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Batphoto from '/images/batclicker.png'
import Batphoto2 from '/images/batclicker3.png'
import Batphoto3 from '/images/batend.png'

axios.defaults.withCredentials = true;

export default function CrashGame() {
  const [gameState, setGameState] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1);
  const [crashPoint, setCrashPoint] = useState(null);
  const [bet, setBet] = useState(10);
  const [cashedOut, setCashedOut] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const pollGameState = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/crash/state");
      setGameState(data.gameState);
      setMultiplier(data.multiplier);
      setCrashPoint(data.crashPoint);
      setCashedOut(data.cashedOut);
      setWinnings(data.winnings);
      setCashoutMultiplier(data.cashoutMultiplier);
      setHistory(data.history);
    } catch (err) {
      console.error("Błąd pobierania stanu gry:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      pollGameState();
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const startGame = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/crash/start", { bet });
      setCrashPoint(res.data.crashPoint);
      setMultiplier(1);
      setCashedOut(false);
      setWinnings(0);
      setCashoutMultiplier(null);
    } catch (err) {
      console.error("Błąd startu gry:", err);
    }
  };

  const handleCashout = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/crash/cashout");
      setWinnings(res.data.winnings);
      setCashedOut(true);
    } catch (err) {
      console.error("Błąd wypłaty:", err);
    }
  };

  return (
    <div className="overflow-hidden">
    <div className="max-w-md mx-auto p-5 text-center font-sans">
      {/* Historia mnożników */}
      <div className="flex justify-center gap-2 mb-2 flex-wrap">
        {history.length === 0 && (
          <div className="text-gray-500 text-sm">Brak historii</div>
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

<div className="text-6xl font-bold font-mono mb-2 flex flex-col items-center justify-center relative">
  {gameState === "crashed" ? (
    <div className="w-[250px] h-[250px] relative">
      <img
        src={Batphoto3}
        alt="Crash"
        className="absolute top-0 left-0 w-[250px] h-[250px]"
      />
    </div>
  ) : gameState === "running" ? (
    <div className="w-[250px] h-[250px] relative">
      <img
        src={Batphoto}
        alt="Bat Base"
        className="absolute top-0 left-0 w-[250px] h-[250px]"
      />
      <img
        src={Batphoto2}
        alt="Bat Overlay"
        className="absolute top-0 left-0 w-[250px] h-[250px] animate-fadeInOut"
      />
    </div>
  ) : null}

  {/* Mnożnik widoczny zawsze, poza waiting bez obrazu */}
  <div className="">{multiplier.toFixed(2)}x</div>
</div>


      {gameState === "waiting" && (
        <input
          type="number"
          min="1"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="p-2 w-full text-lg mb-5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>

        
        
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
    onClick={() => {
      setGameState("waiting");
      startGame();  // <-- tu dodaj wywołanie startGame, żeby zacząć nową rundę
    }}
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
    </div>
  );
}
