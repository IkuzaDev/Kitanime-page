const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression');
const cors = require('cors');
const axios = require('axios');
// const request = require('request'); // ganti kalau bisa

const indexRoutes = require('./routes/index');
const animeRoutes = require('./routes/anime');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const cookieConsent = require('./middleware/cookieConsent');
const adSlots = require('./middleware/adSlots');
const { initializeDatabase } = require('./models/database');

const app = express();

app.use(compression());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.set('views', path.join(process.cwd(), 'views')); // pastiin views di root
app.set('view engine', 'pug');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'kitanime-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400000
  }
}));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cookieConsent);
app.use(adSlots);

// Routes
app.use('/', indexRoutes);
app.use('/anime', animeRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', error: { status: 404, message: 'Page not found' } });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render('error', { title: 'Error', error: { status: err.status || 500, message: err.message } });
});

module.exports = app;
