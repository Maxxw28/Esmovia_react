const express = require('express');
const cors = require('cors');
const session = require('express-session'); // 🆕 dodaj
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // 🆕 pozwala na przesyłanie ciastek
}));

// 🆕 KONFIGURACJA SESJI
app.use(session({
  secret: 'tajny_klucz_sesji', // 🔐 w produkcji przechowuj jako zmienną środowiskową
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true tylko w HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 dzień
  }
}));

// MongoDB
const mongoUri = 'mongodb://172.24.3.152:27017';
const dbName = 'BoomBatDb';

let db, usersCollection;

async function connectToMongo() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection('users');
  console.log('Połączono z MongoDB!');
}
connectToMongo().catch(console.error);

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

    const newUser = {
      username,
      email,
      points: 1000,
      password: hashedPassword,
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

    // 🆕 ZAPISZ DANE DO SESJI
    req.session.user = {
      username: user.username,
      points: user.points
    };

    console.log(`[LOGOWANIE UDANE] ${user.username}`);

    res.status(200).json({
      message: 'Login successful.',
      user: {
        username: user.username,
        email: user.email,
        points: user.points
      }
    });
  } catch (error) {
    console.error(`[LOGOWANIE BŁĄD] ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

///////////////////////////////////// SESJA: POBIERZ ZALOGOWANEGO UŻYTKOWNIKA ////////////////////////////

app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Login error' });
  }
});

///////////////////////////////////// WYLOGOWANIE ///////////////////////////////// <----- DODAĆ PÓŹNIEJ

app.post('/api/logout', (req, res) => { 
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

///////////////////////////////////// START SERWERA ///////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
