// =================================================================
//                    IMPORTOWANIE ZALEŻNOŚCI (MODUŁÓW)
// =================================================================

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// =================================================================
//                    INICJALIZACJA APLIKACJI EXPRESS
// ===============================================================

const app = express();
const port = 5000;

// =================================================================
//                        KONFIGURACJA MIDDLEWARE
// =================================================================

app.use(express.json({ limit: '5mb' }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'tajny_klucz_sesji',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// =================================================================
//                   KONFIGURACJA I POŁĄCZENIE Z MONGODB
// =================================================================

const mongoUri = 'mongodb://172.24.3.152:27017'; // <-------------TU IP SERWERA MONGO
const dbName = 'BoomBatDb';

let db, usersCollection;

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

async function connectToMongo() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection('users');
  console.log('Połączono z MongoDB!');
}
connectToMongo().catch(console.error);

// =================================================================
//                           ENDPOINTY API
// =================================================================


///////////////////////////////////// REJESTRACJA ///////////////////////////////////////////////////////////

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  try {
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {  // <--------- STRUKTURA UŻYTKOWNIKA W DB 
      username,
      email,
      points: 1000,
      password: hashedPassword,
      avatar: '',
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    console.log(`[REJESTRACJA UDANA] ${username} (${email})`);
    res.status(201).json({ message: 'Użytkownik zarejestrowany', userId: result.insertedId });
  } catch (error) {
    console.error(`[REJESTRACJA BŁĄD] ${error.message}`);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

///////////////////////////////////// LOGOWANIE ///////////////////////////////////////////////////////////

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;

  console.log(`[LOGOWANIE] Próba logowania: ${identifier}`);

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required.' });
  }

  try {
    const user = await usersCollection.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    req.session.user = {
      username: user.username,
      email: user.email,
      points: user.points,
      avatar: user.avatar || ''
    };

    console.log(`[LOGOWANIE UDANE] ${user.username}`);

    res.status(200).json({
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    console.error(`[LOGOWANIE BŁĄD] ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

///////////////////////////////////// POBIERZ ZALOGOWANEGO UŻYTKOWNIKA //////////////////////////////////////

app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Brak aktywnej sesji' });
  }
});

///////////////////////////////////// WYLOGOWANIE ///////////////////////////////////////////////////////////

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

///////////////////////////////////// ZAPIS AVATARA (BASE64) ///////////////////////////////////////////////

app.post('/api/upload-avatar', async (req, res) => {
  const { email, avatar } = req.body;

  if (!email || !avatar) {
    return res.status(400).json({ error: 'Brakuje emaila lub avatara.' });
  }

  try {
    const result = await usersCollection.updateOne(
      { email },
      { $set: { avatar } }
    );

    if (result.modifiedCount === 1) {
      if (req.session.user) {
        req.session.user.avatar = avatar;
      }
      res.json({ message: 'Avatar zapisany.' });
    } else {
      res.status(404).json({ error: 'Użytkownik nie znaleziony.' });
    }
  } catch (error) {
    console.error('Błąd przy zapisie avatara:', error);
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

///////////////////////////////////// LEADERBOARD ///////////////////////////////////////////////////

// Pobierz TOP 10 użytkowników z największą liczbą punktów
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await usersCollection
      .find({}, { projection: { _id: 0, username: 1, points: 1, avatar: 1 } })
      .sort({ points: -1 })
      .limit(50) // Top 50 <-------------- można zmienić
      .toArray();

    res.json({ leaderboard });
  } catch (error) {
    console.error('[LEADERBOARD BŁĄD]', error.message);
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

///////////////////////////////////// CRASH API ////////////////////////////////////////////////////

const crashRoutes = require('./crash/routes/crashRoutes');
app.use('/api/crash', crashRoutes);

///////////////////////////////////// AKTUALIZACJA PUNKTÓW ////////////////////////////////////////////////////

app.post('/api/update-points', async (req, res) => {
  const { email, points } = req.body;
  if (!email || typeof points !== 'number') {
    return res.status(400).json({ error: 'Brakuje emaila lub punktów.' });
  }
  try {
    const result = await usersCollection.updateOne(
      { email },
      { $set: { points } }
    );
    if (result.modifiedCount === 1) {
      if (req.session.user) req.session.user.points = points;
      res.json({ message: 'Saldo zaktualizowane.' });
    } else {
      res.status(404).json({ error: 'Użytkownik nie znaleziony.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

///////////////////////////////////// ROULETTE SPIN ////////////////////////////////////////////////////

app.post('/api/roulette-spin', async (req, res) => {
  const { email, bets } = req.body;
  if (!email || !bets) {
    return res.status(400).json({ error: 'Missing email or bets.' });
  }

  // Pobierz użytkownika
  const user = await usersCollection.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found.' });

  // Losowanie liczby (0-36)
  const number = Math.floor(Math.random() * 37); // 0-36
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
  let color = 'green';
  if (number === 0) color = 'green';
  else if (redNumbers.includes(number)) color = 'red';
  else if (blackNumbers.includes(number)) color = 'black';

  // Oblicz sumę zakładów
  let totalBet = 0;
  ["red", "black", "green", "even", "odd", "rangeLow", "rangeHigh"].forEach(key => {
    if (bets[key]?.active && bets[key]?.amount) {
      totalBet += Number(bets[key].amount);
    }
  });
  Object.values(bets.exacts || {}).forEach(val => {
    if (val) totalBet += Number(val);
  });

  if (totalBet > user.points) {
    return res.status(400).json({ error: 'Not enough funds.' });
  }

  // Oblicz wygrane
  let results = {
    red: 0, black: 0, green: 0, even: 0, odd: 0, rangeLow: 0, rangeHigh: 0, exacts: {}
  };

  // Kolory
  if (bets.red?.active && bets.red.amount) {
    results.red = color === 'red' ? bets.red.amount * 2 : -bets.red.amount;
  }
  if (bets.black?.active && bets.black.amount) {
    results.black = color === 'black' ? bets.black.amount * 2 : -bets.black.amount;
  }
  if (bets.green?.active && bets.green.amount) {
    results.green = number === 0 ? bets.green.amount * 35 : -bets.green.amount;
  }

  // Parzyste/Nieparzyste (tylko dla 1-36)
  if (bets.even?.active && bets.even.amount) {
    results.even = number !== 0 && number % 2 === 0 ? bets.even.amount * 2 : -bets.even.amount;
  }
  if (bets.odd?.active && bets.odd.amount) {
    results.odd = number !== 0 && number % 2 === 1 ? bets.odd.amount * 2 : -bets.odd.amount;
  }

  // Zakresy (tylko dla 1-36)
  if (bets.rangeLow?.active && bets.rangeLow.amount) {
    results.rangeLow = number >= 1 && number <= 18 ? bets.rangeLow.amount * 2 : -bets.rangeLow.amount;
  }
  if (bets.rangeHigh?.active && bets.rangeHigh.amount) {
    results.rangeHigh = number >= 19 && number <= 36 ? bets.rangeHigh.amount * 2 : -bets.rangeHigh.amount;
  }

  // Dokładne liczby
  Object.entries(bets.exacts || {}).forEach(([num, amount]) => {
    if (Number(num) === number && amount > 0) {
      results.exacts[num] = amount * 35;
    } else if (amount > 0) {
      results.exacts[num] = -amount;
    } else {
      results.exacts[num] = 0;
    }
  });

  // Suma wygranych
  const totalWin =
    (results.red || 0) +
    (results.black || 0) +
    (results.green || 0) +
    (results.even || 0) +
    (results.odd || 0) +
    (results.rangeLow || 0) +
    (results.rangeHigh || 0) +
    Object.values(results.exacts).reduce((a, b) => a + b, 0);

  // Aktualizuj saldo
  const newBalance = user.points - totalBet + totalWin;
  await usersCollection.updateOne({ email }, { $set: { points: newBalance } });

  // Zwróć wynik
  res.json({
    number,
    color,
    newBalance,
    results,
    message: totalWin > 0 ? "You win!" : totalWin < 0 ? "You lose!" : "No win."
  });
});

// =================================================================
//                           START SERWERA
// =================================================================

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});
