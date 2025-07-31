let crashGame = {
  gameState: 'waiting',
  multiplier: 1,
  crashPoint: null,
  cashedOut: false,
  winnings: 0,
  cashoutMultiplier: null,
  history: [],
  bet: 0
};

let interval = null;

const startCrash = (req, res) => {
  if (crashGame.gameState === 'running') {
    return res.status(400).json({ error: 'Gra już trwa' });
  }

  const rand = Math.random();
  let crashPoint;

  if (rand < 0.15) crashPoint = 1.0;
  else if (rand < 0.5) crashPoint = +(1 + Math.random()).toFixed(2);
  else crashPoint = +(2 + Math.random() * 4.5).toFixed(2);

  crashGame.crashPoint = crashPoint;
  crashGame.gameState = 'running';
  crashGame.multiplier = 1;
  crashGame.cashedOut = false;
  crashGame.winnings = 0;
  crashGame.cashoutMultiplier = null;
  crashGame.bet = req.body.bet || 10;

  interval = setInterval(() => {
    crashGame.multiplier = +(crashGame.multiplier * 1.01).toFixed(2);
    if (crashGame.multiplier >= crashPoint) {
      clearInterval(interval);
      crashGame.gameState = 'crashed';
      if (!crashGame.cashedOut) {
        crashGame.winnings = 0;
        crashGame.cashoutMultiplier = null;
      }
      crashGame.history.unshift(crashPoint);
      crashGame.history = crashGame.history.slice(0, 10);
    }
  }, 100);

  res.json({ message: 'Gra rozpoczęta', crashPoint });
};

const cashOutCrash = (req, res) => {
  if (crashGame.gameState !== 'running' || crashGame.cashedOut) {
    return res.status(400).json({ error: 'Nie można teraz wypłacić' });
  }

  crashGame.cashedOut = true;
  crashGame.winnings = +(crashGame.bet * crashGame.multiplier).toFixed(2);
  crashGame.cashoutMultiplier = crashGame.multiplier;

  res.json({ message: 'Wypłacono', winnings: crashGame.winnings });
};

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

module.exports = {
  startCrash,
  cashOutCrash,
  getCrashState
};
