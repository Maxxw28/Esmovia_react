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
  red: "Red",
  black: "Black",
  green: "Green",
  even: "Even",
  odd: "Odd",
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
  const [lastResults, setLastResults] = useState(null); // <-- nowy stan na boxy wyników

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

    setLastResults(null); // <-- USUŃ boxy wyników przed losowaniem

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
            newWins[key] = -Number(bets[key].amount);
          }
        } else {
          newWins[key] = 0;
        }
      });

      // Parzyste/Nieparzyste
      if (bets.even.active && Number(bets.even.amount) > 0) {
        if (rolledNumber !== 0 && rolledNumber % 2 === 0) {
          const points = Number(bets.even.amount) * payoutInfo.even;
          winAmount += points;
          newWins.even = points;
        } else {
          newWins.even = -Number(bets.even.amount);
        }
      } else {
        newWins.even = 0;
      }
      if (bets.odd.active && Number(bets.odd.amount) > 0) {
        if (rolledNumber % 2 === 1) {
          const points = Number(bets.odd.amount) * payoutInfo.odd;
          winAmount += points;
          newWins.odd = points;
        } else {
          newWins.odd = -Number(bets.odd.amount);
        }
      } else {
        newWins.odd = 0;
      }

      // Zakresy
      if (bets.rangeLow.active && Number(bets.rangeLow.amount) > 0) {
        if (rolledNumber >= 1 && rolledNumber <= 18) {
          const points = Number(bets.rangeLow.amount) * payoutInfo.rangeLow;
          winAmount += points;
          newWins.rangeLow = points;
        } else {
          newWins.rangeLow = -Number(bets.rangeLow.amount);
        }
      } else {
        newWins.rangeLow = 0;
      }
      if (bets.rangeHigh.active && Number(bets.rangeHigh.amount) > 0) {
        if (rolledNumber >= 19 && rolledNumber <= 36) {
          const points = Number(bets.rangeHigh.amount) * payoutInfo.rangeHigh;
          winAmount += points;
          newWins.rangeHigh = points;
        } else {
          newWins.rangeHigh = -Number(bets.rangeHigh.amount);
        }
      } else {
        newWins.rangeHigh = 0;
      }

      // Konkretne liczby - zapisz wyniki dla wszystkich liczb
      const exactResults = {};
      rouletteOrder.forEach((n) => {
        if (n === 0) return;
        const betAmount = bets.exacts[n] || 0;
        if (Number(n) === rolledNumber && betAmount > 0) {
          exactResults[n] = betAmount * 35;
        } else if (betAmount > 0) {
          exactResults[n] = -betAmount;
        } else {
          exactResults[n] = 0;
        }
      });

      const newBalance = balance - totalBet() + winAmount;

      setBalance(newBalance);
      setWins(newWins);
      setMessage(
        winAmount > 0
          ? `Wygrałeś ${winAmount} zł! (${rolledNumber} - ${COLORS[color]})`
          : `Przegrałeś. Wypadło ${rolledNumber} (${COLORS[color]})`
      );
      setSpinning(false);
      setBets(initialBets);

      // ZAPISZ boxy wyników na sztywno
      setLastResults({
        red: newWins.red,
        black: newWins.black,
        green: newWins.green,
        even: newWins.even,
        odd: newWins.odd,
        rangeLow: newWins.rangeLow,
        rangeHigh: newWins.rangeHigh,
        exacts: exactResults, // <-- dodaj wyniki dla wszystkich liczb
      });

      setTimeout(() => setWins({}), 7000);
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
      style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
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
        minHeight: 48,
        color: value > 0 ? "#FFD700" : value < 0 ? "#FF3333" : "#888888",
        backgroundColor: "rgba(0,0,0,0.15)",
        borderColor: value > 0 ? "#FFD700" : value < 0 ? "#FF3333" : "#888888",
        borderWidth: 2,
        transition: "background 0.2s"
      }}
    >
      {value > 0 ? `+${value}` : value < 0 ? value : "0"}
    </div>
  );

  // Szerokość kolumny tabeli
  const colWidth = "min-w-[140px] max-w-[180px] w-full";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-10 px-4" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
      <h1 className="text-3xl font-bold mb-6">Roulette</h1>

      <RouletteStrip selectedNumber={result?.number ?? 0} spinning={spinning} onEnd={() => {}} />

      <button
        onClick={() => {
          setWins({});
          setLastResults(null);
          handleSpin();
        }}
        disabled={spinning}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-10 py-2 rounded text-lg transition w-64"
        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Player balance */}
      <div className="mt-4 mb-2 text-2xl font-bold text-center" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
        Balance: <span className="font-bold">{balance} zł</span>
      </div>

      {/* Total bet */}
      <div className="mb-2 text-lg font-semibold text-center" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
        Total bet: <span className="font-bold">{totalBet()} zł</span>
      </div>

      {/* Total win */}
      <div className="mb-4 text-lg font-semibold text-center" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
        Total win:{" "}
        <span className="font-bold" style={{
          color:
            lastResults &&
            (
              (lastResults.red || 0) +
              (lastResults.black || 0) +
              (lastResults.green || 0) +
              (lastResults.even || 0) +
              (lastResults.odd || 0) +
              (lastResults.rangeLow || 0) +
              (lastResults.rangeHigh || 0) +
              (lastResults.exacts
                ? Object.values(lastResults.exacts).reduce((a, b) => a + b, 0)
                : 0)
            ) > 0
              ? "#FFD700"
              : (
                lastResults &&
                (
                  (lastResults.red || 0) +
                  (lastResults.black || 0) +
                  (lastResults.green || 0) +
                  (lastResults.even || 0) +
                  (lastResults.odd || 0) +
                  (lastResults.rangeLow || 0) +
                  (lastResults.rangeHigh || 0) +
                  (lastResults.exacts
                    ? Object.values(lastResults.exacts).reduce((a, b) => a + b, 0)
                    : 0)
                ) < 0
              )
              ? "#FF3333"
              : "#888888"
        }}>
          {lastResults
            ? (() => {
                const sum =
                  (lastResults.red || 0) +
                  (lastResults.black || 0) +
                  (lastResults.green || 0) +
                  (lastResults.even || 0) +
                  (lastResults.odd || 0) +
                  (lastResults.rangeLow || 0) +
                  (lastResults.rangeHigh || 0) +
                  (lastResults.exacts
                    ? Object.values(lastResults.exacts).reduce((a, b) => a + b, 0)
                    : 0);
                return sum > 0 ? `+${sum}` : sum;
              })()
            : "0"}
        </span> zł
      </div>

      <div className="w-full max-w-md mt-8 flex flex-col gap-2">
        <div className="w-full">
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className={`text-center font-semibold ${colWidth}`}>Bet</div>
            <div className={`text-center font-semibold ${colWidth}`}>Amount</div>
            <div className={`text-center font-semibold ${colWidth}`}>Result</div>
          </div>
          {/* Kolory */}
          {["red", "black", "green"].map((key) => (
            <div key={key} className="grid grid-cols-3 gap-3 items-center mb-2">
              <div className={colWidth}>
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={categoryLabels[key]}
                />
              </div>
              <div className={colWidth}>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => {
                    // Pozwól tylko na liczby całkowite
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    handleAmount(key, val);
                  }}
                  onKeyDown={e => {
                    // Blokuj wszystkie znaki poza cyframi, backspace, delete, tab, arrows, home, end
                    if (
                      !(
                        (e.key >= "0" && e.key <= "9") ||
                        ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Amount"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div className={colWidth}>
                <ResultBox
                  value={lastResults ? lastResults[key] : ""}
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
            <div key={key} className="grid grid-cols-3 gap-3 items-center mb-2">
              <div className={colWidth}>
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={label}
                />
              </div>
              <div className={colWidth}>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => {
                    // Pozwól tylko na liczby całkowite
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    handleAmount(key, val);
                  }}
                  onKeyDown={e => {
                    // Blokuj wszystkie znaki poza cyframi, backspace, delete, tab, arrows, home, end
                    if (
                      !(
                        (e.key >= "0" && e.key <= "9") ||
                        ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Amount"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div className={colWidth}>
                <ResultBox
                  value={lastResults ? lastResults[key] : ""}
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
            <div key={key} className="grid grid-cols-3 gap-3 items-center mb-2">
              <div className={colWidth}>
                <CustomCheckbox
                  checked={bets[key].active}
                  onChange={(checked) => handleCheck(key, checked)}
                  colorClass={categoryStyles[key]}
                  label={label}
                />
              </div>
              <div className={colWidth}>
                <input
                  type="number"
                  min={1}
                  disabled={!bets[key].active}
                  value={bets[key].amount}
                  onChange={e => {
                    // Pozwól tylko na liczby całkowite
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    handleAmount(key, val);
                  }}
                  onKeyDown={e => {
                    // Blokuj wszystkie znaki poza cyframi, backspace, delete, tab, arrows, home, end
                    if (
                      !(
                        (e.key >= "0" && e.key <= "9") ||
                        ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 rounded-lg text-black bg-white text-lg border border-gray-300 focus:outline-none"
                  placeholder="Amount"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
              </div>
              <div className={colWidth}>
                <ResultBox
                  value={lastResults ? lastResults[key] : ""}
                  colorClass={categoryStyles[key]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Konkretne liczby */}
      <div className="mt-6 w-full max-w-3xl">
        <p className="text-sm mb-2 text-center">Choose numbers and amounts (x35):</p>
        <div className="grid grid-cols-4 gap-6">
          {rouletteOrder.filter((num) => num !== 0).map((num) => {
            // Ustal kolor tła jak na ruletce
            let btnColor = "bg-gray-700 text-white";
            if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num)) {
              btnColor = "bg-red-600 text-white";
            } else if (
              [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(num)
            ) {
              btnColor = "bg-black text-white";
            }
            if (bets.exacts[num]) {
              btnColor = "bg-white text-black border-2 border-yellow-400";
            }

            // Wylicz wynik dla tej liczby na podstawie ostatniego losowania
            let exactResult = "0";
            if (lastResults && lastResults.exacts && lastResults.exacts[num] !== undefined) {
              const val = lastResults.exacts[num];
              if (val > 0) exactResult = "+" + val;
              else if (val < 0) exactResult = val.toString();
              else exactResult = "0";
            }

            return (
              <div key={num} className="flex flex-col items-center w-full">
                <button
                  onClick={() =>
                    bets.exacts[num]
                      ? handleRemoveExact(num)
                      : handleExactBetChange(num, 1)
                  }
                  className={`text-xl h-16 w-full rounded ${btnColor}`}
                  style={{
                    fontFamily: "'Montserrat', Arial, sans-serif'",
                    minWidth: 120,
                    maxWidth: 180,
                  }}
                >
                  {num}
                </button>
                <div className="flex flex-col items-center mt-3 w-full">
                  <input
                    type="number"
                    min={1}
                    value={bets.exacts[num] || ""}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      handleExactBetChange(num, val);
                    }}
                    onKeyDown={e => {
                      if (
                        !(
                          (e.key >= "0" && e.key <= "9") ||
                          ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full text-xl rounded-lg text-black bg-white border border-gray-300 px-6 py-3 text-center"
                    style={{
                      fontFamily: "'Montserrat', Arial, sans-serif'",
                      minWidth: 120,
                      maxWidth: 180,
                    }}
                  />
                </div>
                <div
                  className="w-full px-4 py-2 rounded-lg border-2 font-bold text-xl flex items-center justify-center mt-2"
                  style={{
                    fontFamily: "'Bebas Neue', 'Montserrat', Arial, sans-serif",
                    minHeight: 48,
                    minWidth: 120,
                    maxWidth: 180,
                    color:
                      exactResult.startsWith("+")
                        ? "#FFD700"
                        : exactResult.startsWith("-")
                        ? "#FF3333"
                        : "#888888",
                    backgroundColor: "rgba(0,0,0,0.15)",
                    borderColor:
                      exactResult.startsWith("+")
                        ? "#FFD700"
                        : exactResult.startsWith("-")
                        ? "#FF3333"
                        : "#888888",
                    borderWidth: 2,
                    transition: "background 0.2s"
                  }}
                >
                  {exactResult}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Roulette;