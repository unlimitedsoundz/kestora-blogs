// Simple server entry point for Hostinger
require('dotenv').config();
const { app } = require('./app');

module.exports = app;