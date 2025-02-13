// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Damit dein Frontend (HTML) unter derselben Domain ausgeliefert wird:
app.use(express.static('public'));

// JWT-Geheimnis aus der .env
const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecret';

// Beispiel-Admin-Benutzer (username: "admin") mit einem vorab gehashten Passwort ("1234")
// Den Hash kannst du mit z. B. bcrypt.hashSync('1234', 10) erzeugen.
const adminUser = {
  username: 'admin',
  passwordHash: '$2b$10$GhZJ8/Z5tA1ZC2VXcFxVtOyF23yT8JN9GxRbCExwGQJZG4Sv73KxS' // Hash für "1234"
};

// Login-Endpunkt
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUser.username) {
    return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
  }

  const valid = await bcrypt.compare(password, adminUser.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
  }

  // Erstelle ein Token (gültig für 1 Stunde)
  const token = jwt.sign({ username: adminUser.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware zum Schutz von Endpunkten
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// In-Memory-Speicher für Produkte (nur zu Demo-Zwecken)
let products = [
  { id: 1, name: 'Produkt 1', price: 9.99, points: 10, description: 'Erstes Produkt' },
  { id: 2, name: 'Produkt 2', price: 19.99, points: 20, description: 'Zweites Produkt' }
];

// Geschützter Endpunkt: Produkte abrufen
app.get('/api/products', authenticateJWT, (req, res) => {
  res.json(products);
});

// Geschützter Endpunkt: Neues Produkt hinzufügen
app.post('/api/products', authenticateJWT, (req, res) => {
  const { name, price, points, description, imageData } = req.body;
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name,
    price,
    points,
    description,
    imageData
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Geschützter Endpunkt: Produkt aktualisieren
app.put('/api/products/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Produkt nicht gefunden' });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// Geschützter Endpunkt: Produkt löschen
app.delete('/api/products/:id', authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  res.sendStatus(204);
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
