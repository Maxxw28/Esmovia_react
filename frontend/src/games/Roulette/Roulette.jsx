import React, { useState } from "react";
import RouletteStrip from "./RouletteStrip";

const Roulette = () => {
  const [selectedColor, setSelectedColor] = useState("red");
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");

  const COLORS = {
    red: "Czerwony",
    black: "Czarny",
    green: "Zielony",
  };

  const handleSpin = () => {
    if (spinning) return;
    if (betAmount > balance) {
      setMessage("Za mało środków!");
      return;
    }

    const rolledNumber = Math.floor(Math.random() * 37);
    const color = rolledNumber === 0 ? "green" : rolledNumber % 2 === 0 ? "black" : "red";

    setSpinning(true);
    setResult({ number: rolledNumber, color });

    setTimeout(() => {
      const win = color === selectedColor;
      const winAmount = win ? betAmount * (selectedColor === "green" ? 14 : 2) : 0;
      const newBalance = balance - betAmount + winAmount;

      setBalance(newBalance);
      setMessage(
        win
          ? `Wygrałeś ${winAmount} zł! (${rolledNumber} - ${COLORS[color]})`
          : `Przegrałeś. Wypadło ${rolledNumber} (${COLORS[color]})`
      );
      setSpinning(false);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Ruletka</h1>

      <RouletteStrip
        selectedNumber={result?.number ?? 0}
        spinning={spinning}
        onEnd={() => {}}
      />

      {/* Przyciski kolorów */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setSelectedColor("red")}
          className={`px-4 py-2 rounded text-white text-sm transition ${
            selectedColor === "red" ? "bg-red-600" : "bg-red-800 hover:bg-red-700"
          }`}
        >
          Czerwony
        </button>
        <button
          onClick={() => setSelectedColor("black")}
          className={`px-4 py-2 rounded text-white text-sm transition ${
            selectedColor === "black" ? "bg-black" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Czarny
        </button>
        <button
          onClick={() => setSelectedColor("green")}
          className={`px-4 py-2 rounded text-white text-sm transition ${
            selectedColor === "green" ? "bg-green-600" : "bg-green-800 hover:bg-green-700"
          }`}
        >
          Zielony
        </button>
      </div>

      {/* Zakład */}
      <div className="flex flex-col items-center mt-6 space-y-3">
        <label className="text-white text-sm mb-1">Twój zakład:</label>
        <input
          type="number"
          min={1}
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="px-4 py-2 w-40 rounded-md text-center text-black text-lg bg-white focus:outline-none"
        />

        {/* Popularne wartości */}
        <div className="flex gap-2">
          {[10, 50, 100, 500].map((val) => (
            <button
              key={val}
              onClick={() => setBetAmount(val)}
              className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm transition"
            >
              {val} zł
            </button>
          ))}
        </div>
      </div>

      {/* Przycisk zakręć */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-lg transition"
        style={{ marginTop: "30px" }}
      >
        {spinning ? "Kręcę..." : "Zakręć"}
      </button>

      {/* Saldo + komunikat */}
      <div className="mt-6 text-center">
        <p className="text-lg">Saldo: <span className="font-bold">{balance} zł</span></p>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default Roulette;
