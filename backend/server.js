// backend/server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;
app.use(express.json());
app.use(cors());

// ----------------- KONFIGURACJA MONGO DB ----------------
const mongoUri = 'mongodb://localhost:27017'; // Adres lokalnego MongoDB
const dbName = 'BoomBatDb';                   // Nazwa bazy danych
let db, BoomBatCollection;

async function connectToMongo() {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    BoomBatCollection = db.collection('BoomBat');
    console.log('Połączono z MongoDB!');
}
connectToMongo().catch(console.error);

// ------------- WORKING AREA (TUTAJ PRZYKŁADOWA ROUTA) -------------

// ------ TRASA WYŚWIETLAJĄCA INFORMACJĘ NA / ------
app.get('/', (req, res) => {
  res.send("Backend BoomBat jest online!");
});


// Example route to test the backend
app.get('/api/data', async (req, res) => {
    try {
        // Przykład pobrania danych z kolekcji BoomBat:
        const items = await BoomBatCollection.find({}).toArray();
        res.json({ message: 'BoomBat hell yeah!', data: items });
    } catch (error) {
        res.status(500).json({ error: "Błąd bazy danych" });
    }
});

// Przykład dodania nowego wpisu do kolekcji BoomBat
app.post('/api/data', async (req, res) => {
    try {
        const obj = req.body; // np. { nazwa: "Nowy rekord" }
        const result = await BoomBatCollection.insertOne(obj);
        res.json({ insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Błąd przy dodawaniu" });
    }
});

// -------------- END OF WORKING AREA ----------------------

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
