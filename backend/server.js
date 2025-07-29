const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const mongoUri = 'mongodb://localhost:27017';
const dbName = 'BoomBatDb';

let db;
let BoomBatCollection;
let usersCollection;

async function connectToMongo() {
  const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);

  BoomBatCollection = db.collection('BoomBat');
  usersCollection = db.collection('users');

  console.log('Połączono z MongoDB!');
}
connectToMongo().catch(console.error);

// Trasa podstawowa
app.get('/', (req, res) => {
  res.send("Backend BoomBat jest online!");
});

// Przykładowa trasa do kolekcji BoomBat
app.get('/api/data', async (req, res) => {
  try {
    const items = await BoomBatCollection.find({}).toArray();
    res.json({ message: 'BoomBat hell yeah!', data: items });
  } catch (error) {
    res.status(500).json({ error: "Błąd bazy danych" });
  }
});

// Dodawanie nowego wpisu do BoomBat
app.post('/api/data', async (req, res) => {
  try {
    const obj = req.body; 
    const result = await BoomBatCollection.insertOne(obj);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Błąd przy dodawaniu" });
  }
});

// *** Endpoint rejestracji użytkownika ***
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  try {
    // Sprawdzenie czy użytkownik istnieje (email lub username)
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

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
