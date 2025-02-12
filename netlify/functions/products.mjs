// netlify/functions/products.mjs

// Globale Variable als In-Memory-Speicher (nicht persistent!)
let productsStore = [];

export async function handler(event) {
  const method = event.httpMethod;

  try {
    // GET: Alle Produkte abrufen
    if (method === "GET") {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productsStore)
      };
    }

    // POST: Neues Produkt speichern
    if (method === "POST") {
      const newProduct = JSON.parse(event.body);
      // Neue ID erstellen (z. B. anhand der aktuellen Zeit)
      newProduct.id = Date.now().toString();
      productsStore.push(newProduct);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      };
    }

    // DELETE: Produkt löschen
    if (method === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Keine Produkt-ID angegeben" })
        };
      }
      const initialLength = productsStore.length;
      productsStore = productsStore.filter(product => product.id !== id);
      if (productsStore.length === initialLength) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Produkt nicht gefunden" })
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Produkt gelöscht" })
      };
    }

    // Für andere HTTP-Methoden
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
}
