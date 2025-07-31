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
  red: { active: false, amount: "" },
  black: { active: false, amount: "" },
  green: { active: false, amount: "" },
  even: { active: false, amount: "" },
  odd: { active: false, amount: "" },
  rangeLow: { active: false, amount: "" },   // 1-18
  rangeHigh: { active: false, amount: "" },  // 19-36
  exacts: {}, // { [number]: amount }
};

const payoutInfo = {
  red: 2,
  black: 2,
  green: 35,
  even: 2,
  odd: 2,
  rangeLow: 2,
  rangeHigh: 2,
};

const categoryStyles = {
  red: "bg-red-600 border-red-700 text-white",
  black: "bg-black border-gray-700 text-white",
  green: "bg-green-700 border-green-800 text-white",
  even: "bg-blue-600 border-blue-700 text-white",
  odd: "bg-yellow-600 border-yellow-700 text-black",
  rangeLow: "bg-purple-600 border-purple-700 text-white",
  rangeHigh: "bg-pink-600 border-pink-700 text-white",
};

const categoryLabels = {
  red: "Czerwony",
  black: "Czarny",
  green: "Zielony",
  even: "Parzyste",
  odd: "Nieparzyste",
  rangeLow: "1-18",
  rangeHigh: "19-36",
};

const Roulette = () => {
  const [balance, setBalance] = useState(1000);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [bets, setBets] = useState(initialBets);
  const [wins, setWins] = useState({}); // { betKey: liczba punktów/null }

  // Obsługa zmiany checkboxa i kwoty
  const handleCheck = (key, checked) => {
    setBets((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: checked }
    }));
  };

  const handleAmount = (key, value) => {
    setBets((prev) => ({
      ...prev,
      [key]: { ...prev[key], amount: value }
    }));
  };

  // Suma wszystkich postawionych kwot
  const totalBet = () => {
    let sum = 0;
    ["red", "black", "green", "even", "odd", "rangeLow", "rangeHigh"].forEach((key) => {
      const bet = bets[key];
      if (bet.active && Number(bet.amount) > 0) sum += Number(bet.amount);
    });
    for (const n in bets.exacts) {
      if (bets.exacts[n]) sum += bets.exacts[n];
    }
    return sum;
  };

  // Obsługa zakładów na konkretne liczby (nie zmieniamy)
  const handleExactBetChange = (num, amount) => {
    setBets((prev) => ({
      ...prev,
      exacts: {
        ...prev.exacts,
        [num]: Number(amount) > 0 ? Number(amount) : undefined
      }
    }));
  };

  const handleRemoveExact = (num) => {
    setBets((prev) => {
      const newExacts = { ...prev.exacts };
      delete newExacts[num];
      return { ...prev, exacts: newExacts };
    });
  };

  const handleSpin = () => {
    if (spinning) return;

    // Sprawdź czy jest jakikolwiek aktywny zakład
    const anyActive =
      ["red", "black", "green", "even", "odd", "rangeLow", "rangeHigh"].some(
        (key) => bets[key].active && Number(bets[key].amount) > 0
      ) ||
      Object.values(bets.exacts).filter(Boolean).length > 0;

    if (!anyActive) {
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
      const newWins = {};

      // Kolory
      ["red", "black", "green"].forEach((key) => {
        if (bets[key].active && Number(bets[key].amount) > 0) {
          if (key === color) {
            const points = Number(bets[key].amount) * payoutInfo[key];
            winAmount += points;
            newWins[key] = points;
          } else {
            newWins[key] = 0;
          }
        }
      });

      // Parzyste/Nieparzyste
      if (bets.even.active && Number(bets.even.amount) > 0) {
        if (rolledNumber !== 0 && rolledNumber % 2 === 0) {
          const points = Number(bets.even.amount) * payoutInfo.even;
          winAmount += points;
          newWins.even = points;
        } else {
          newWins.even = 0;
        }
      }
      if (bets.odd.active && Number(bets.odd.amount) > 0) {
        if (rolledNumber % 2 === 1) {
          const points = Number(bets.odd.amount) * payoutInfo.odd;
          winAmount += points;
          newWins.odd = points;
        } else {
          newWins.odd = 0;
        }
      }

      // Zakresy
      if (bets.rangeLow.active && Number(bets.rangeLow.amount) > 0) {
        if (rolledNumber >= 1 && rolledNumber <= 18) {
          const points = Number(bets.rangeLow.amount) * payoutInfo.rangeLow;
          winAmount += points;
          newWins.rangeLow = points;
        } else {
          newWins.rangeLow = 0;
        }
      }
      if (bets.rangeHigh.active && Number(bets.rangeHigh.amount) > 0) {
        if (rolledNumber >= 19 && rolledNumber <= 36) {
          const points = Number(bets.rangeHigh.amount) * payoutInfo.rangeHigh;
          winAmount += points;
          newWins.rangeHigh = points;
        } else {
          newWins.rangeHigh = 0;
        }
      }

      // Konkretne liczby (nie zmieniamy)
      for (const n in bets.exacts) {
        if (Number(n) === rolledNumber && bets.exacts[n] > 0) {
          winAmount += bets.exacts[n] * 35;
        }
      }

      const newBalance = balance - totalBet() + winAmount;

      setBalance(newBalance);
      setWins(newWins);
      setMessage(
        winAmount > 0
          ? `Wygrałeś ${winAmount} zł! (${rolledNumber} - ${COLORS[color]})`
          : `Przegrałeś. Wypadło ${rolledNumber} (${COLORS[color]})`
      );
      setSpinning(false);
      setBets(initialBets); // wyczyść zakłady po spinie
      setTimeout(() => setWins({}), 7000); // WYDŁUŻONY czas komunikatów do 7s
    }, 2800);
  };

  // Custom prostokątny "checkbox" z napisem i kolorem kategorii
  const CustomCheckbox = ({ checked, onChange, colorClass, label }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full px-4 py-2 rounded-lg border-2 font-semibold text-base ${colorClass} focus:outline-none transition ${
        checked ? "opacity-100" : "opacity-50"
      }`}
      aria-pressed={checked}
      tabIndex={0}
      style={{ fontFamily: "'Montserrat', Arial, sans-serif", minWidth: 120 }}
    >
      {label}
    </button>
  );

  // Prostokąt z wynikiem zakładu
  const ResultBox = ({ value, colorClass }) => (
    <div
      className={`w-full px-4 py-2 rounded-lg border-2 font-bold text-xl flex items-center justify-center ${colorClass}`}
      style={{
        fontFamily: "'Bebas Neue', 'Montserrat', Arial, sans-serif",
        minWidth: 120,
        minHeight: 48,
        color: value > 0 ? "#FFD700" : value < 0 ? "#FF3333" : "#888888",
        backgroundColor: "rgba(0,0,0,0.15)",
        borderColor: value > 0 ? "#FFD700" : value < 0 ? "#FF3333" : "#888888",
        borderWidth: 2,
        margin: "0 auto"
      }}
    >
      {value > 0 ? `+${value}` : value < 0 ? value : "0"}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-10 px-4" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
      <h1 className="text-3xl font-bold mb-6">Ruletka</h1>

      <RouletteStrip selectedNumber={result?.number ?? 0} spinning={spinning} onEnd={() => {}} />

      <div className="w-full max-w-md mt-8 flex flex-col gap-2">

        {/* Zakłady pojedyncze - KAŻDY OSOBNO */}
        <div className="flex flex-col gap-2">
          {/* Kolory */}
          {["red", "black", "green"].map((key) => (
            <div key={key} className="grid grid-cols-3 gap-2 items-center">
              <div className="flex justify-center w-full">
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={categoryLabels[key]}
                />
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => handleAmount(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Kwota"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div>
                <ResultBox
                  value={
                    wins[key] !== undefined
                      ? bets[key].active && Number(bets[key].amount) > 0
                        ? wins[key] > 0
                          ? wins[key]
                          : -Number(bets[key].amount)
                        : 0
                      : ""
                  }
                  colorClass={categoryStyles[key]}
                />
              </div>
            </div>
          ))}

          {/* Parzyste/Nieparzyste */}
          {[
            { key: "even", label: "Parzyste" },
            { key: "odd", label: "Nieparzyste" },
          ].map(({ key, label }) => (
            <div key={key} className="grid grid-cols-3 gap-2 items-center">
              <div className="flex justify-center w-full">
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={label}
                />
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => handleAmount(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Kwota"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div>
                <ResultBox
                  value={
                    wins[key] !== undefined
                      ? bets[key].active && Number(bets[key].amount) > 0
                        ? wins[key] > 0
                          ? wins[key]
                          : -Number(bets[key].amount)
                        : 0
                      : ""
                  }
                  colorClass={categoryStyles[key]}
                />
              </div>
            </div>
          ))}

          {/* Zakresy */}
          {[
            { key: "rangeLow", label: "1-18" },
            { key: "rangeHigh", label: "19-36" },
          ].map(({ key, label }) => (
            <div key={key} className="grid grid-cols-3 gap-2 items-center">
              <div className="flex justify-center w-full">
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={label}
                />
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => handleAmount(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Kwota"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div>
                <ResultBox
                  value={
                    wins[key] !== undefined
                      ? bets[key].active && Number(bets[key].amount) > 0
                        ? wins[key] > 0
                          ? wins[key]
                          : -Number(bets[key].amount)
                        : 0
                      : ""
                  }
                  colorClass={categoryStyles[key]}
                />
              </div>
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
                style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
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
                    style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3">
        <div className="text-lg font-semibold" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
          Suma zakładów: <span className="font-bold">{totalBet()} zł</span>
        </div>
      </div>

      <button
        onClick={() => {
          setWins({}); // wyzeruj wyniki przed losowaniem
          handleSpin();
        }}
        disabled={spinning}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-lg transition"
        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
      >
        {spinning ? "Kręcę..." : "Zakręć"}
      </button>

      {/* Wyniki zakładów */}
      <div className="mt-6 w-full max-w-md flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {["red", "black", "green"].map((key) => (
            <ResultBox
              key={key}
              value={
                wins[key] !== undefined
                  ? bets[key].active && Number(bets[key].amount) > 0
                    ? wins[key] > 0
                      ? wins[key]
                      : -Number(bets[key].amount)
                    : 0
                  : ""
              }
              colorClass={categoryStyles[key]}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "even", label: "Parzyste" },
            { key: "odd", label: "Nieparzyste" },
          ].map(({ key }) => (
            <ResultBox
              key={key}
              value={
                wins[key] !== undefined
                  ? bets[key].active && Number(bets[key].amount) > 0
                    ? wins[key] > 0
                      ? wins[key]
                      : -Number(bets[key].amount)
                    : 0
                  : ""
              }
              colorClass={categoryStyles[key]}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "rangeLow", label: "1-18" },
            { key: "rangeHigh", label: "19-36" },
          ].map(({ key }) => (
            <ResultBox
              key={key}
              value={
                wins[key] !== undefined
                  ? bets[key].active && Number(bets[key].amount) > 0
                    ? wins[key] > 0
                      ? wins[key]
                      : -Number(bets[key].amount)
                    : 0
                  : ""
              }
              colorClass={categoryStyles[key]}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-2xl font-bold" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
          Saldo: <span className="font-bold">{balance} zł</span>
        </p>
        {message && (
          <p
            className="mt-4 text-2xl font-bold"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif", color: "#FFD700" }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Roulette;