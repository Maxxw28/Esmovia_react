import React, { useState } from "react";
import RouletteStrip from "./RouletteStrip";

const COLORS = {
  red: "Czerwony",
  black: "Czarny",
  green: "Zielony",
};

const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27,
  13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const initialBets = {
  color: { value: null, amount: 0 },
  range: { value: null, amount: 0 },
  parity: { value: null, amount: 0 },
  exacts: {}, // { [number]: amount }
};

const quickAmounts = [10, 50, 100];

const Roulette = () => {
  const [balance, setBalance] = useState(1000);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [bets, setBets] = useState(initialBets);

  // Obsługa zakładów na kolor, zakres, parzystość
  const handleBetChange = (type, value, amount) => {
    setBets((prev) => ({
      ...prev,
      [type]: { value, amount: Number(amount) }
    }));
  };

  // Obsługa zakładów na konkretne liczby
  const handleExactBetChange = (num, amount) => {
    setBets((prev) => ({
      ...prev,
      exacts: {
        ...prev.exacts,
        [num]: Number(amount) > 0 ? Number(amount) : undefined
      }
    }));
  };

  // Usuwanie zakładu na liczbę
  const handleRemoveExact = (num) => {
    setBets((prev) => {
      const newExacts = { ...prev.exacts };
      delete newExacts[num];
      return { ...prev, exacts: newExacts };
    });
  };

  // Suma wszystkich postawionych kwot
  const totalBet = () => {
    let sum = 0;
    if (bets.color.amount > 0) sum += bets.color.amount;
    if (bets.range.amount > 0) sum += bets.range.amount;
    if (bets.parity.amount > 0) sum += bets.parity.amount;
    for (const n in bets.exacts) {
      if (bets.exacts[n]) sum += bets.exacts[n];
    }
    return sum;
  };

  const handleSpin = () => {
    if (spinning) return;
    if (
      (!bets.color.value || bets.color.amount <= 0) &&
      (!bets.range.value || bets.range.amount <= 0) &&
      (!bets.parity.value || bets.parity.amount <= 0) &&
      Object.values(bets.exacts).filter(Boolean).length === 0
    ) {
      setMessage("Nie wybrano żadnego zakładu!");
      return;
    }
    if (totalBet() > balance) {
      setMessage("Za mało środków!");
      return;
    }

    const rolledNumber = rouletteOrder[Math.floor(Math.random() * rouletteOrder.length)];
    const color = rolledNumber === 0 ? "green" :
      [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(rolledNumber) ? "red" : "black";

    setResult({ number: rolledNumber, color });
    setSpinning(true);
    setMessage("");

    setTimeout(() => {
      let winAmount = 0;

      // Kolor
      if (bets.color.value && bets.color.amount > 0 && bets.color.value === color) {
        winAmount += bets.color.amount * (bets.color.value === "green" ? 35 : 2);
      }

      // Zakres
      if (bets.range.value && bets.range.amount > 0) {
        if (bets.range.value === "1-18" && rolledNumber >= 1 && rolledNumber <= 18)
          winAmount += bets.range.amount * 2;
        if (bets.range.value === "19-36" && rolledNumber >= 19 && rolledNumber <= 36)
          winAmount += bets.range.amount * 2;
      }

      // Parzystość
      if (bets.parity.value && bets.parity.amount > 0) {
        if (bets.parity.value === "even" && rolledNumber !== 0 && rolledNumber % 2 === 0)
          winAmount += bets.parity.amount * 2;
        if (bets.parity.value === "odd" && rolledNumber % 2 === 1)
          winAmount += bets.parity.amount * 2;
      }

      // Konkretne liczby
      for (const n in bets.exacts) {
        if (Number(n) === rolledNumber && bets.exacts[n] > 0) {
          winAmount += bets.exacts[n] * 35;
        }
      }

      const newBalance = balance - totalBet() + winAmount;

      setBalance(newBalance);
      setMessage(
        winAmount > 0
          ? `Wygrałeś ${winAmount} zł! (${rolledNumber} - ${COLORS[color]})`
          : `Przegrałeś. Wypadło ${rolledNumber} (${COLORS[color]})`
      );
      setSpinning(false);
      setBets(initialBets); // wyczyść zakłady po spinie
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Ruletka</h1>

      <RouletteStrip selectedNumber={result?.number ?? 0} spinning={spinning} onEnd={() => {}} />

      <div className="w-full max-w-md mt-8 flex flex-col gap-3">

        {/* Kolor */}
        <div className="grid grid-cols-2 gap-3">
          {["red", "black"].map((color) => (
            <div key={color} className="flex flex-col">
              <button
                onClick={() =>
                  handleBetChange("color", color, bets.color.value === color ? 0 : bets.color.amount)
                }
                className={`px-3 py-2 rounded font-medium ${
                  bets.color.value === color ? "bg-white text-black" : `bg-${color}-600 text-white`
                }`}
              >
                {COLORS[color]}
              </button>
              {bets.color.value === color && (
                <div className="flex flex-col items-center mt-2 w-full">
                  <input
                    type="number"
                    min={1}
                    placeholder="Kwota na kolor"
                    value={bets.color.amount}
                    onChange={e =>
                      handleBetChange("color", color, e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleBetChange("color", color, val)}
                        className="bg-white text-black px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <button
            onClick={() =>
              handleBetChange("color", "green", bets.color.value === "green" ? 0 : bets.color.amount)
            }
            className={`w-full px-3 py-2 rounded font-medium ${
              bets.color.value === "green" ? "bg-white text-black" : "bg-green-700 text-white"
            }`}
          >
            Zielony
          </button>
          {bets.color.value === "green" && (
            <div className="flex flex-col items-center mt-2 w-full">
              <input
                type="number"
                min={1}
                placeholder="Kwota na kolor"
                value={bets.color.amount}
                onChange={e =>
                  handleBetChange("color", "green", e.target.value)
                }
                className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleBetChange("color", "green", val)}
                    className="bg-white text-black px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zakres */}
        <div className="grid grid-cols-2 gap-3">
          {["1-18", "19-36"].map((range) => (
            <div key={range} className="flex flex-col">
              <button
                onClick={() =>
                  handleBetChange("range", range, bets.range.value === range ? 0 : bets.range.amount)
                }
                className={`px-3 py-2 rounded font-medium ${
                  bets.range.value === range ? "bg-white text-black" : "bg-blue-700"
                }`}
              >
                Zakres {range}
              </button>
              {bets.range.value === range && (
                <div className="flex flex-col items-center mt-2 w-full">
                  <input
                    type="number"
                    min={1}
                    placeholder="Kwota na zakres"
                    value={bets.range.amount}
                    onChange={e =>
                      handleBetChange("range", range, e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleBetChange("range", range, val)}
                        className="bg-white text-black px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Parzyste/Nieparzyste */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "even", label: "Parzyste" },
            { key: "odd", label: "Nieparzyste" },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col">
              <button
                onClick={() =>
                  handleBetChange("parity", key, bets.parity.value === key ? 0 : bets.parity.amount)
                }
                className={`px-3 py-2 rounded font-medium ${
                  bets.parity.value === key ? "bg-white text-black" : "bg-purple-700"
                }`}
              >
                {label}
              </button>
              {bets.parity.value === key && (
                <div className="flex flex-col items-center mt-2 w-full">
                  <input
                    type="number"
                    min={1}
                    placeholder="Kwota na parzystość"
                    value={bets.parity.amount}
                    onChange={e =>
                      handleBetChange("parity", key, e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleBetChange("parity", key, val)}
                        className="bg-white text-black px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Konkretne liczby */}
      <div className="mt-6 w-full max-w-md">
        <p className="text-sm mb-2 text-center">Wybierz liczby i kwoty (x35):</p>
        <div className="grid grid-cols-9 gap-1">
          {rouletteOrder.filter((num) => num !== 0).map((num) => (
            <div key={num} className="flex flex-col items-center w-full">
              <button
                onClick={() =>
                  bets.exacts[num]
                    ? handleRemoveExact(num)
                    : handleExactBetChange(num, 1)
                }
                className={`text-xs h-8 w-8 rounded ${
                  bets.exacts[num] ? "bg-white text-black" : "bg-gray-700 text-white"
                }`}
              >
                {num}
              </button>
              {bets.exacts[num] !== undefined && (
                <div className="flex flex-col items-center mt-1 w-full">
                  <input
                    type="number"
                    min={1}
                    value={bets.exacts[num]}
                    onChange={e => handleExactBetChange(num, e.target.value)}
                    className="w-full text-lg rounded-lg text-black bg-white border border-gray-300 px-2 py-1 text-center"
                  />
                  <div className="flex gap-1 mt-1">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleExactBetChange(num, val)}
                        className="bg-white text-black px-1 py-0.5 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3">
        <div className="text-sm">
          Suma zakładów: <span className="font-bold">{totalBet()} zł</span>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-lg transition"
      >
        {spinning ? "Kręcę..." : "Zakręć"}
      </button>

      <div className="mt-6 text-center">
        <p className="text-lg">
          Saldo: <span className="font-bold">{balance} zł</span>
        </p>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default Roulette;