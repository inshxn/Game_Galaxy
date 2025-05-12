const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database('./game.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Connected to SQLite database.');
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    suggestion TEXT NOT NULL
  )
`);

// Handle form submission
app.post('/submit-suggestion', (req, res) => {
  const { name, suggestion } = req.body;

  db.run(
    `INSERT INTO suggestions (name, suggestion) VALUES (?, ?)`,
    [name, suggestion],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.send("❌ Failed to submit review.");
      }
      res.send(`
        <h2 style="text-align:center;margin-top:50px;">✅ Thank you for your feedback, ${name}!</h2>
        <div style="text-align:center;margin-top:20px;">
          <a href="/" style="font-size:18px;text-decoration:none;color:orange;">⬅️ Back to Dashboard</a>
        </div>
      `);
    }
  );
});

// Show all reviews
app.get('/reviews', (req, res) => {
  db.all('SELECT * FROM suggestions', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.send("❌ Error retrieving reviews.");
    }

    let html = `
      <!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Submitted Reviews</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <style>
        body {
          background: linear-gradient(to right, #2c5364, #203a43, #0f2027);
          color: white;
        }
        .review-card {
          background-color: #34495e;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .container { max-width: 700px; }
        a { color: #ffc107; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
      </head><body>
      <div class="container py-5">
        <h2 class="text-center mb-4">📋 Submitted Reviews</h2>
    `;

    rows.forEach(row => {
      html += `
        <div class="review-card">
          <h5>${row.name}</h5>
          <p>${row.suggestion}</p>
        </div>
      `;
    });

    html += `
        <div class="text-center mt-4">
          <a href="/" class="btn btn-warning">⬅️ Back to Dashboard</a>
        </div>
      </div>
      </body></html>
    `;

    res.send(html);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
