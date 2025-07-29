const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

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

// Endpoint rejestracji
app.post('/api/register', async (req, res) => {
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
      password: hashedPassword,
      createdAt: new Date()
    };

    // Dodaj do bazy
    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'Użytkownik zarejestrowany', userId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
