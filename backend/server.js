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

// =================================================================
//                           START SERWERA
// =================================================================

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});
