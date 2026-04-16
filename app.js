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
// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Explicit CSS serving route (fallback if static middleware fails)
app.get('/css/output.css', (req, res) => {
  const fs = require('fs');
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');

  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'no-cache');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    res.send(cssContent);
    console.log('CSS served via explicit route');
  } else {
    console.log('CSS file not found');
    res.status(404).send('CSS file not found');
  }
});

// Debug routes (before main router to avoid conflicts)
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

// Check CSS URL resolution
app.get('/css-check', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const cssUrl = `${protocol}://${host}/css/output.css`;
  res.send(`CSS URL: ${cssUrl}<br><a href="${cssUrl}">Test CSS URL</a><br><a href="/css-content">View CSS Content</a>`);
});

// View CSS content directly
app.get('/css-content', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');

  try {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(`CSS File Size: ${cssContent.length} characters\n\nFirst 500 chars:\n${cssContent.substring(0, 500)}`);
  } catch (error) {
    res.status(500).send(`Error reading CSS: ${error.message}`);
  }
});

// Check HTML output
app.get('/html-test', (req, res) => {
  const ejs = require('ejs');
  const path = require('path');

  const templatePath = path.join(__dirname, 'views', 'layouts', 'main.ejs');
  const fs = require('fs');

  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, {
      title: 'HTML Test Page',
      body: '<h1>HTML Test</h1><p>If you see this, EJS is working!</p>'
    });
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Test CSS serving
app.get('/static-test', (req, res) => {
  res.send(`
    <h1>Static File Test</h1>
    <link href="/css/output.css?v=${Date.now()}" rel="stylesheet">
    <div class="bg-blue-500 text-white p-4 m-4 rounded">
      If you see this with blue background, CSS is working!
    </div>
    <p class="text-red-500 font-bold">This should be red and bold if CSS loads.</p>
    <p class="text-lg text-green-600">This should be large and green if CSS loads.</p>
  `);
});

// Routes
app.use('/', indexRouter);

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