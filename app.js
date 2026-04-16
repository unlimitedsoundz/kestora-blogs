const express = require('express');
const path = require('path');
require('dotenv').config();

const indexRouter = require('./routes/index');

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);

// Debug routes
app.get('/test-css', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');

  if (fs.existsSync(cssPath)) {
    const stats = fs.statSync(cssPath);
    res.send(`CSS file exists! Size: ${stats.size} bytes<br>Last modified: ${stats.mtime}`);
  } else {
    res.send('CSS file NOT found!');
  }
});

// Direct CSS serving route
app.get('/css-direct', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');

  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(cssPath);
  } else {
    res.status(404).send('CSS file not found');
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', status: 404 });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong', status: 500 });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Blog app listening on port ${PORT}`);
});

// Export for testing
module.exports = { app, server };

module.exports = app;