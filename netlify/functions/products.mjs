// netlify/functions/products.mjs
import fs from 'fs/promises';
const filePath = './data/products.json';

export async function handler(event) {
  const method = event.httpMethod;

  try {
    // GET: Alle Produkte abrufen
    if (method === "GET") {
      const data = await fs.readFile(filePath, 'utf-8');
      return {
        statusCode: 200,
        body: data
      };
    }

    // POST: Neues Produkt speichern
    if (method === "POST") {
      const newProduct = JSON.parse(event.body);

      // Bestehende Produkte laden
      let products = [];
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        products = JSON.parse(data);
      } catch (err) {
        // Falls die Datei nicht existiert, starten wir mit einem leeren Array
        if (err.code !== 'ENOENT') throw err;
      }

      // Neue ID für das Produkt erstellen
      newProduct.id = Date.now().toString();
      products.push(newProduct);

      // Produkte in JSON-Datei speichern
      await fs.writeFile(filePath, JSON.stringify(products, null, 2));

      return {
        statusCode: 200,
        body: JSON.stringify(newProduct)
      };
    }

    // DELETE: Produkt löschen
    if (method === "DELETE") {
      const { id } = event.queryStringParameters;
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Keine Produkt-ID angegeben" })
        };
      }

      // Produkte laden und das entsprechende Produkt entfernen
      const data = await fs.readFile(filePath, 'utf-8');
      let products = JSON.parse(data);
      products = products.filter(product => product.id !== id);

      // Aktualisierte Produkte speichern
      await fs.writeFile(filePath, JSON.stringify(products, null, 2));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Produkt gelöscht" })
      };
    }

    // Falls eine andere HTTP-Methode verwendet wird
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}