// Entry point for Hostinger - delegates to server.js
require('dotenv').config();
const app = require('./server');

module.exports = app;