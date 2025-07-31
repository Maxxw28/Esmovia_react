// Obiekt przechowujący aktualny stan gry crash
let crashGame = {
  gameState: 'waiting',        // Stan gry: 'waiting', 'running', 'crashed'
  multiplier: 1,               // Aktualny mnożnik
  crashPoint: null,            // Punkt, w którym gra się zakończy (eksplozja)
  cashedOut: false,            // Czy gracz wypłacił przed wybuchem?
  winnings: 0,                 // Wygrana gracza
  cashoutMultiplier: null,     // Mnożnik przy którym gracz wypłacił
  history: [],                 // Historia ostatnich crashów
  bet: 0                       // Wysokość zakładu
};

let interval = null; // Referencja do interwału, który kontroluje wzrost mnożnika

// Funkcja rozpoczynająca nową rundę gry crash
const startCrash = (req, res) => {
  if (crashGame.gameState === 'running') {
    return res.status(400).json({ error: 'Gra już trwa' });
  }

  // Generowanie punktu crasha na podstawie losowości
  const rand = Math.random();
  let crashPoint;

  if (rand < 0.2) crashPoint = 1.0; // 20% szansy na instant crash przy 1.0x
  else if (rand < 0.7) crashPoint = +(1 + Math.random()).toFixed(2); // 50% szansy na crash między 1.0x a 2.0x
  else crashPoint = +(2 + Math.random() * 4.5).toFixed(2); // 30% szansy na crash między 2.0x a 6.5x

  // Ustawienie stanu gry
  crashGame.crashPoint = crashPoint;
  crashGame.gameState = 'running';
  crashGame.multiplier = 1;
  crashGame.cashedOut = false;
  crashGame.winnings = 0;
  crashGame.cashoutMultiplier = null;
  crashGame.bet = req.body.bet || 10; // Ustaw zakład, domyślnie 10

  // Symulacja wzrostu mnożnika w czasie co 100ms
  interval = setInterval(() => {
    crashGame.multiplier = +(crashGame.multiplier * 1.01).toFixed(2); // Wzrost mnożnika o 1% w każdej iteracji

    // Jeśli osiągnięto crash point, kończymy rundę
    if (crashGame.multiplier >= crashPoint) {
      clearInterval(interval);
      crashGame.gameState = 'crashed';

      // Jeśli gracz nie wypłacił — przegrywa
      if (!crashGame.cashedOut) {
        crashGame.winnings = 0;
        crashGame.cashoutMultiplier = null;
      }

      // Dodaj crash point do historii i przytnij do ostatnich 10
      crashGame.history.unshift(crashPoint);
      crashGame.history = crashGame.history.slice(0, 10);
    }
  }, 100);

  res.json({ message: 'Gra rozpoczęta', crashPoint });
};

// Funkcja wypłacająca wygraną gracza
const cashOutCrash = (req, res) => {
  // Nie można wypłacić jeśli gra nie trwa lub już wypłacono
  if (crashGame.gameState !== 'running' || crashGame.cashedOut) {
    return res.status(400).json({ error: 'Nie można teraz wypłacić' });
  }

  // Oznacz jako wypłacone i oblicz wygraną
  crashGame.cashedOut = true;
  crashGame.winnings = +(crashGame.bet * crashGame.multiplier).toFixed(2);
  crashGame.cashoutMultiplier = crashGame.multiplier;

  res.json({ message: 'Wypłacono', winnings: crashGame.winnings });
};

// Funkcja zwracająca aktualny stan gry do frontendu
const getCrashState = (req, res) => {
  res.json({
    gameState: crashGame.gameState,
    multiplier: crashGame.multiplier,
    crashPoint: crashGame.crashPoint,
    cashedOut: crashGame.cashedOut,
    winnings: crashGame.winnings,
    cashoutMultiplier: crashGame.cashoutMultiplier,
    history: crashGame.history,
    bet: crashGame.bet
  });
};

// Eksport kontrolerów gry
module.exports = {
  startCrash,
  cashOutCrash,
  getCrashState
};
