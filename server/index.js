const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Session authentication
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // true for prod
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Set session information and message data
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.messages = req.session.messages || null;
    delete req.session.messages;
    next();
});

// Footer data available on all pages
app.use((req, res, next) => {
    res.locals.footer = {
        text: 'All rights reserved.',
        email: 'someone@example.com',
        emailText: 'Water Warden',
        year: new Date().getFullYear(),
    };
    next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

// Static files
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter)
app.use('/auth', authRouter);

app.use((req, res) => res.status(404).send('Page not found.'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});