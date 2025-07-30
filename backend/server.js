const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const mongoUri = 'mongodb://172.24.3.152:27017'; //Tutaj ip zmieniamy kiedy nowy internet
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

app.post('/api/register', async (req, res) => { // Endpoint rejestracji
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  try {
    // Sprawdź czy użytkownik już istnieje (email lub username)
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    // Zhashuj hasło
    const hashedPassword = await bcrypt.hash(password, 10);

    // Stwórz obiekt użytkownika
    const newUser = {
      username,
      email,
      points: 1000,  //PUNKTY STARTOWE UZYTKWONIKA PRZY REJESTRACJI
      password: hashedPassword,
      createdAt: new Date()
    };

    // Dodaj do bazy
    const result = await usersCollection.insertOne(newUser);

    console.log(`[REJESTRACJA UDANA] Zarejestrowano użytkownika: ${username} (${email}) | ID: ${result.insertedId}`);
    res.status(201).json({ message: 'Użytkownik zarejestrowany', userId: result.insertedId });
  } catch (error) {
    console.error(`[REJESTRACJA BŁĄD] ${username} (${email}) | ${error.message}`);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

///////////////////////////////////// REJESTRACJA ///////////////////////////////////////////////////////////

///////////////////////////////////// LOGOWANIE ///////////////////////////////////////////////////////////

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; // ZAMIANA email → identifier

  console.log(`[LOGOWANIE] Próba logowania: ${identifier}`);

  if (!identifier || !password) {
    console.log(`[LOGOWANIE NIEUDANE] Brak identyfikatora lub hasła`);
    return res.status(400).json({ error: 'Email/nazwa użytkownika i hasło są wymagane' });
  }

  try {
    // Szukamy użytkownika po emailu LUB nazwie użytkownika
    const user = await usersCollection.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      console.log(`[LOGOWANIE NIEUDANE] Użytkownik nie istnieje: ${identifier}`);
      return res.status(401).json({ error: 'Nieprawidłowy email/username lub hasło' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log(`[LOGOWANIE NIEUDANE] Błędne hasło dla: ${identifier}`);
      return res.status(401).json({ error: 'Nieprawidłowy email/username lub hasło' });
    }

    console.log(`[LOGOWANIE UDANE] Zalogowano użytkownika: ${user.username} (${user.email})`);

    res.status(200).json({
      message: 'Zalogowano pomyślnie',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
      },
    });
  } catch (error) {
    console.error(`[LOGOWANIE BŁĄD] ${identifier} | ${error.message}`);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

///////////////////////////////////// LOGOWANIE ///////////////////////////////////////////////////////////

